import type { Request, Response } from 'express';

export const getCandles = (req: Request, res: Response) => {
  const {name, fragrances, brand} = req.body;
  
};