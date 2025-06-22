import { UUID } from "crypto";

export type Shop = {
    id: UUID;
    name: string;
    email: string;
    phone: string;
    description: string;
}