package controllers

import (
	"context"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CarsController struct {
	client *mongo.Client
}

func NewCarsController(client *mongo.Client) *CarsController {
	return &CarsController{client: client}
}

func (c *CarsController) collection() *mongo.Collection {
	return c.client.Database("vscar").Collection("cars")
}

func (c *CarsController) Index(ctx *gin.Context) {
	routes := []string{
		"GET /",
		"GET /cars",
		"GET /cars/:id",
		"GET /cars/db/version",
		"GET /cars/attributes/names?text=...",
		"GET /cars/attributes/values?text=...",
		"POST /cars/findByFilter",
	}
	ctx.String(http.StatusOK, "API:\n\n%s\n", strings.Join(routes, "\n"))
}

func (c *CarsController) DbVersion(ctx *gin.Context) {
	var result bson.M
	err := c.collection().FindOne(ctx, bson.M{}).Decode(&result)
	if err != nil {
		ctx.Status(http.StatusNotFound)
		return
	}
	processed, ok := result["processed_date"].(string)
	if !ok {
		ctx.Status(http.StatusNotFound)
		return
	}
	parts := strings.Split(processed, ".")
	ctx.String(http.StatusOK, parts[0])
}

func (c *CarsController) GetCars(ctx *gin.Context) {
	findOptions := options.Find().SetSort(bson.M{"price": 1}).SetLimit(10)
	cursor, err := c.collection().Find(ctx, bson.M{}, findOptions)
	if err != nil {
		ctx.Status(http.StatusInternalServerError)
		return
	}
	var cars []bson.M
	if err := cursor.All(ctx, &cars); err != nil {
		ctx.Status(http.StatusInternalServerError)
		return
	}
	ctx.JSON(http.StatusOK, cars)
}

func (c *CarsController) GetCar(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.Status(http.StatusBadRequest)
		return
	}
	var car bson.M
	err = c.collection().FindOne(ctx, bson.M{"adac_id": id}).Decode(&car)
	if err != nil {
		ctx.Status(http.StatusNotFound)
		return
	}
	ctx.JSON(http.StatusOK, car)
}

type QueryRange struct {
	Min *int `json:"min"`
	Max *int `json:"max"`
}

type QueryAttr struct {
	Name   string      `json:"name"`
	Values []*string   `json:"values"`
	Range  *QueryRange `json:"range"`
}

type Query struct {
	Page       int         `json:"page"`
	Limit      *int        `json:"limit"`
	Text       string      `json:"text"`
	Attributes []QueryAttr `json:"attributes"`
}

type PaginatedResult struct {
	Docs   []bson.M `json:"docs"`
	Total  int      `json:"total"`
	Limit  int      `json:"limit"`
	Page   int      `json:"page"`
	Pages  int      `json:"pages"`
	Offset int      `json:"offset"`
}

func (c *CarsController) FindByFilter(ctx *gin.Context) {
	var q Query
	if err := ctx.BindJSON(&q); err != nil {
		ctx.Status(http.StatusBadRequest)
		return
	}
	limit := 100
	if q.Limit != nil {
		limit = *q.Limit
	}

	var attrQueries []bson.M
	for _, attr := range q.Attributes {
		var ors []bson.M
		if attr.Range != nil {
			ors = append(ors, bson.M{"attributes": bson.M{"$elemMatch": bson.M{
				"name":  attr.Name + "|fixed",
				"value": bson.M{"$gte": attr.Range.Min, "$lte": attr.Range.Max},
			}}})
		}
		if len(attr.Values) > 0 {
			ors = append(ors, bson.M{"attributes": bson.M{"$elemMatch": bson.M{
				"name":  attr.Name,
				"value": bson.M{"$in": attr.Values},
			}}})
		}
		if len(ors) > 0 {
			attrQueries = append(attrQueries, bson.M{"$or": ors})
		}
	}

	dbQuery := bson.M{}
	if len(attrQueries) > 0 {
		dbQuery["$and"] = attrQueries
	}
	if q.Text != "" {
		dbQuery["name"] = bson.M{"$regex": q.Text, "$options": "i"}
	}

	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: dbQuery}},
		bson.D{{Key: "$sort", Value: bson.M{"price": 1}}},
		bson.D{{Key: "$facet", Value: bson.M{
			"paginatedResults": mongo.Pipeline{
				bson.D{{Key: "$skip", Value: (q.Page - 1) * limit}},
				bson.D{{Key: "$limit", Value: limit}},
			},
			"totalCount": mongo.Pipeline{
				bson.D{{Key: "$count", Value: "total"}},
			},
		}}},
	}

	ctxTimeout, cancel := context.WithTimeout(ctx.Request.Context(), 30*time.Second)
	defer cancel()
	cursor, err := c.collection().Aggregate(ctxTimeout, pipeline)
	if err != nil {
		ctx.Status(http.StatusInternalServerError)
		return
	}
	var aggRes []bson.M
	if err := cursor.All(ctx, &aggRes); err != nil {
		ctx.Status(http.StatusInternalServerError)
		return
	}
	if len(aggRes) == 0 {
		ctx.JSON(http.StatusOK, PaginatedResult{Page: q.Page, Limit: limit})
		return
	}
	doc := aggRes[0]
	totalCount := 0
	if arr, ok := doc["totalCount"].(primitive.A); ok && len(arr) > 0 {
		if m, ok := arr[0].(bson.M); ok {
			switch v := m["total"].(type) {
			case int32:
				totalCount = int(v)
			case int64:
				totalCount = int(v)
			case float64:
				totalCount = int(v)
			case int:
				totalCount = v
			}
		}
	}
	var results []bson.M
	if arr, ok := doc["paginatedResults"].(primitive.A); ok {
		for _, v := range arr {
			if m, ok := v.(bson.M); ok {
				results = append(results, m)
			}
		}
	}
	pages := 0
	if limit > 0 {
		pages = (totalCount + limit - 1) / limit
	}
	out := PaginatedResult{Docs: results, Total: totalCount, Limit: limit, Page: q.Page, Pages: pages, Offset: (q.Page - 1) * limit}
	ctx.JSON(http.StatusOK, out)
}

func (c *CarsController) FindNames(ctx *gin.Context) {
	text := ctx.Query("text")
	var doc bson.M
	if err := c.collection().FindOne(ctx, bson.M{}).Decode(&doc); err != nil {
		ctx.Status(http.StatusNotFound)
		return
	}
	attrs, _ := doc["attributes"].(primitive.A)
	namesSet := map[string]struct{}{}
	for _, a := range attrs {
		if m, ok := a.(bson.M); ok {
			name, _ := m["name"].(string)
			if name != "" && !strings.HasSuffix(name, "fixed") && strings.Contains(strings.ToLower(name), strings.ToLower(text)) {
				namesSet[name] = struct{}{}
			}
		}
	}
	names := make([]string, 0, len(namesSet))
	for k := range namesSet {
		names = append(names, k)
	}
	sort.Strings(names)
	ctx.JSON(http.StatusOK, names)
}

type AttrValue struct {
	Type             string         `json:"type"`
	AdditionalValues []*string      `json:"additional_values"`
	Range            map[string]int `json:"range"`
}

func (c *CarsController) FindValues(ctx *gin.Context) {
	text := ctx.Query("text")
	filter := bson.M{"attributes": bson.M{"$elemMatch": bson.M{"name": text}}}
	findOpts := options.FindOne().SetProjection(bson.M{"attributes.$": 1})
	var doc bson.M
	if err := c.collection().FindOne(ctx, filter, findOpts).Decode(&doc); err != nil {
		ctx.Status(http.StatusNotFound)
		return
	}
	attrs, _ := doc["attributes"].(primitive.A)
	if len(attrs) == 0 {
		ctx.Status(http.StatusNotFound)
		return
	}
	first, _ := attrs[0].(bson.M)
	colData, _ := first["column_data"].(bson.M)
	attType, _ := colData["type"].(string)
	switch attType {
	case "int", "float":
		rng, _ := colData["range"].(bson.M)
		minInt := 0
		maxInt := 0
		switch v := rng["min"].(type) {
		case int32:
			minInt = int(v)
		case int64:
			minInt = int(v)
		case float64:
			minInt = int(v)
		case int:
			minInt = v
		}
		switch v := rng["max"].(type) {
		case int32:
			maxInt = int(v)
		case int64:
			maxInt = int(v)
		case float64:
			maxInt = int(v)
		case int:
			maxInt = v
		}
		out := AttrValue{Type: attType, Range: map[string]int{"min": minInt, "max": maxInt}}
		if add, ok := colData["additional_values"].(primitive.A); ok {
			for _, v := range add {
				if s, ok := v.(string); ok {
					sv := s
					out.AdditionalValues = append(out.AdditionalValues, &sv)
				} else {
					out.AdditionalValues = append(out.AdditionalValues, nil)
				}
			}
		}
		ctx.JSON(http.StatusOK, out)
		return
	case "str":
		pipeline := mongo.Pipeline{
			bson.D{{Key: "$unwind", Value: "$attributes"}},
			bson.D{{Key: "$match", Value: bson.M{"attributes.name": text}}},
			bson.D{{Key: "$project", Value: bson.M{"_id": 0, "value": "$attributes.value"}}},
		}
		cursor, err := c.collection().Aggregate(ctx.Request.Context(), pipeline)
		if err != nil {
			ctx.Status(http.StatusInternalServerError)
			return
		}
		var res []bson.M
		if err := cursor.All(ctx, &res); err != nil {
			ctx.Status(http.StatusInternalServerError)
			return
		}
		set := map[string]struct{}{}
		hasNil := false
		for _, r := range res {
			if v, ok := r["value"].(string); ok {
				set[v] = struct{}{}
			} else {
				hasNil = true
			}
		}
		values := make([]*string, 0, len(set)+1)
		for v := range set {
			vv := v
			values = append(values, &vv)
		}
		sort.Slice(values, func(i, j int) bool {
			if values[i] == nil {
				return true
			}
			if values[j] == nil {
				return false
			}
			return *values[i] < *values[j]
		})
		if hasNil {
			values = append(values, nil)
		}
		ctx.JSON(http.StatusOK, values)
		return
	default:
		ctx.Status(http.StatusNotFound)
		return
	}
}
