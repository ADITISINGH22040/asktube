import {Sequelize, Transaction} from 'sequelize';

export async function withTransaction<T>(
  sequelize: Sequelize,
  callback: (transaction: Transaction) => Promise<T>
): Promise<T> {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
