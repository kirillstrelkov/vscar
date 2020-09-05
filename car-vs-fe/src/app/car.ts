export interface Car {
    name: string;
    id: string;
    adac_id: string;
    image: string;
    processed_date: string;
    url: string;
    power: number;
    fuel: string;
    price: number;
    checksum: string;
    attributes: { name: string, value: string }[];
    // TODO: add transmission
}