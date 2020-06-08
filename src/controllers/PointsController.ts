import { Request, Response } from "express";
import knex from "../database/connection";

class PointsController {
  async index(request: Request, response: Response) {
    const { uf, city, items } = request.query;

    let parsedItems: number[];
    if (String(items).trim() !== "") {
      parsedItems = String(items)
        .split(",")
        .map((item) => Number(item.trim()));
    }

    const points = await knex("points")
      .join("points_items", "points.id", "=", "point_id")

      .modify(function (queryBuilder) {
        if (parsedItems) {
          queryBuilder.whereIn("item_id", parsedItems);
        }
        if (city) {
          queryBuilder.where("city", String(city));
        }
        if (uf) {
          queryBuilder.where("uf", String(uf));
        }
      })

      .distinct()
      .select("points.*");

    const serializedPoints = points.map((point) => {
      return {
        ...point,
        imagePath: `http://192.168.0.27:3333/uploads/${point.image}`,
      };
    });

    return response.json(serializedPoints);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex("points").where("id", id).first();

    if (!point) {
      return response.status(404);
    }

    const serializedPoint = {
      ...point,
      imagePath: `http://192.168.0.27:3333/uploads/${point.image}`,
    };

    const items = await knex("items")
      .join("points_items", "items.id", "=", "item_id")
      .where("point_id", id);

    return response.json({ ...serializedPoint, items });
  }

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const trx = await knex.transaction();

    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    const insertedId = await trx("points").insert(point);

    const point_id = insertedId[0];

    const pointItems = items
      .split(",")
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          point_id,
          item_id,
        };
      });

    await trx("points_items").insert(pointItems);

    await trx.commit();

    return response.json({ id: point_id, ...point });
  }
}

export default PointsController;
