import React, { useEffect, useState } from 'react';
import { PaginationHelpers } from './PaginationHelpers';

export const ROWS_PER_PAGE_OPTIONS = [20, 50, 100];

const usPaginationState = (initSize?: number, onChange?: (page: number, size: number) => void): PaginationHelpers => {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(initSize ?? ROWS_PER_PAGE_OPTIONS[0]);
  const [totalElements, setTotalElements] = useState(0);

  const helpers: PaginationHelpers = {
    handleChangePage: (newPage: number) => setPage(newPage),
    handleChangeRowsPerPage: (rowsPerPage: number) => {
      setSize(rowsPerPage);
      setPage(0);
    },
    handleChangeTotalElements: (value: number) => setTotalElements(value),
    getTotalElements: () => totalElements,
  };

  useEffect(() => {
    onChange?.(page, size);
  }, [page, size]);

  return helpers;
};

export default usPaginationState;
