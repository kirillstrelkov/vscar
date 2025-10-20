# README

This repository contains code for car comparision app.

## Live Demo

- Frontend: https://vscar.vercel.app

## Database

Use [MongoDB Compass](https://www.mongodb.com/products/compass) to access database with uri: `mongodb+srv://<username>:<password>@cluster0.zsfsj.mongodb.net/vscar`.

For better performance, indexes for next keys should be created:

- adac_id
- name
- price
- attributes.name
- attributes.value

## Backend

Check [/back](/back) folder

### Performance analysis

Check [tests/perf_test/Analysis.ipynb](tests/perf_test/Analysis.ipynb)

## Frontend

Check [/front](/front) folder
