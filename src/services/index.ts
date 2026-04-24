import {
  FindAttributeOptions,
  FindOptions,
  GroupOption,
  Includeable,
  Model,
  ModelStatic,
  OrderItem,
  Transaction,
  WhereOptions,
} from "sequelize";
import { ConflictError, NotFoundError } from "../errors";
import { PaginatedResponse, ReqQueryOptions } from "../types/general.interface";
import helperUtil from "../utils/helper.util";

class BaseService<T extends Model> {
  baseModel: ModelStatic<T> = null;

  constructor(
    private model: ModelStatic<T>,
    private name: string
  ) {
    this.baseModel = model;
  }

  public async getAll(
    whereQuery: WhereOptions<T>,
    includeables?: Includeable[],
    limit?: number,
    order?: OrderItem[],
    attributes?: FindAttributeOptions,
    group?: GroupOption
  ): Promise<T[]> {
    const query: FindOptions<T> = {
      where: whereQuery,
      include: includeables,
    };

    if (limit) {
      query.limit = limit;
    }

    if (order) {
      query.order = order;
    }

    if (attributes) {
      query.attributes = attributes;
    }

    if (group) {
      query.group = group;
    }

    const records: T[] = await this.model.findAll(query);

    return records;
  }

  public async getAllForAnalytic(
    whereQuery: WhereOptions<T>,
    attributes?: FindAttributeOptions,
    includeables?: Includeable[],
    group?: GroupOption,
    order?: OrderItem[],
    raw?: boolean,
    nest?: boolean,
    limit?: number
  ): Promise<T[]> {
    const query: FindOptions<T> = {
      where: whereQuery,
      attributes,
      include: includeables,
      group,
      order,
      raw,
      nest,
      limit,
    };

    const records: T[] = await this.model.findAll(query);

    return records;
  }

  public async getAllPaginated(
    whereQuery: WhereOptions<T>,
    queryOpts: ReqQueryOptions,
    includeables?: Includeable[],
    order?: OrderItem[],
    attributes?: FindAttributeOptions
  ): Promise<PaginatedResponse<T>> {
    const { page, limit, offset } = queryOpts;

    const { rows: result, count: totalCount }: { rows: T[]; count: number } =
      await this.model.findAndCountAll({
        where: whereQuery,
        attributes,
        limit,
        offset,
        include: includeables,
        order: order ? order : [["createdAt", "DESC"]],
      });

    const paginationData = helperUtil.getPaginationData(limit, page, totalCount);

    return { result, totalCount, ...paginationData };
  }

  public async get(
    whereQuery: WhereOptions<T>,
    includeables?: Includeable[],
    order?: OrderItem[],
    attributes?: FindAttributeOptions,
    group?: GroupOption,
    transaction?: Transaction
  ): Promise<T> {
    const record: T | null = await this.model.findOne({
      where: whereQuery,
      include: includeables,
      attributes,
      group,
      order,
      transaction,
    });

    return record;
  }

  public async count(whereQuery: WhereOptions<T>, includeables?: Includeable[]): Promise<number> {
    const count: number = await this.model.count({
      where: whereQuery,
      include: includeables,
    });

    return count;
  }

  public async getOrError(
    whereQuery: WhereOptions<T>,
    includeables?: Includeable[],
    attributes?: FindAttributeOptions
  ): Promise<T> {
    const record: T | null = await this.model.findOne({
      where: whereQuery,
      include: includeables,
      attributes,
    });

    if (!record) {
      throw new NotFoundError(`This ${this.name.toLowerCase()} could not be found.`);
    }

    return record as T;
  }

  public async getById(
    id: number,
    includeables?: Includeable[],
    transaction?: Transaction
  ): Promise<T> {
    const record: T | null = await this.model.findByPk(id, {
      include: includeables,
      transaction,
    });

    return record;
  }

  public async getByIdOrError(id: number, includeables?: Includeable[]): Promise<T> {
    const record: T | null = await this.model.findByPk(id, {
      include: includeables,
    });

    if (!record) {
      throw new NotFoundError(`This ${this.name.toLowerCase()} could not be found.`);
    }

    return record;
  }

  public async delete(whereQuery: WhereOptions<T>): Promise<number> {
    const record = await this.model.destroy({ where: whereQuery });
    return record;
  }

  public async deleteOrError(whereQuery: WhereOptions<T>, force: boolean = false): Promise<void> {
    const record = await this.model.destroy({ where: whereQuery, force });

    if (!record) {
      throw new NotFoundError(`This ${this.name.toLowerCase()} could not be found.`);
    }
  }

  public async sum(fieldName: string, whereQuery: WhereOptions<T>): Promise<number> {
    const sumOfRecords = await this.model.sum(fieldName, {
      where: whereQuery,
    });

    return sumOfRecords ?? 0;
  }

  public async validateField(
    whereQuery: WhereOptions<T>,
    fieldName: string = "name",
    throwError: boolean = true
  ): Promise<T> {
    const record: T | null = await this.model.findOne({
      where: whereQuery,
    });

    if (record && throwError) {
      throw new ConflictError(
        `A ${this.name.toLowerCase()} with this ${fieldName} already exists.`
      );
    }

    return record;
  }

  protected generateIncludeable<T extends Model>(
    model: ModelStatic<T>,
    alias: string,
    attributes?: string[],
    where?: WhereOptions<T>,
    includeables?: Includeable[],
    required?: boolean,
    order?: OrderItem[]
  ): Includeable {
    const include: Includeable = {
      model,
      as: alias,
      attributes,
      where,
      order,
      separate: order ? true : false,
      required,
      ...(includeables && { include: includeables }),
    };

    return include;
  }
}

export default BaseService;
