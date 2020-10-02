export interface Car {
    name: string;
    id: string; // TODO: check if id or _id should be here
    adac_id: number;
    image: string;
    processed_date: string;
    url: string;
    power: number;
    transmission: string;
    fuel: string;
    price: number;
    checksum: string;
    attributes: { name: string, value: string }[];
}
