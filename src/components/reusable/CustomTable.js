//import {UserListHead, UserListToolbar} from "../../sections/@dashboard/user";
import {
  Box,
  Checkbox,
  OutlinedInput,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { filter, debounce } from "lodash";
import { useEffect, useState } from "react";
import ListTableToolbar from "./ListTableToolbar";
import Palette from "../../utils/Palette";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";

function applySortFilter(array, comparator, query, columns) {
  if (!array) return [];
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (obj) => {
      for (let c of columns) {
        if (c.filter && obj) {
          if (!obj[c.id]) {
            continue;
          }
          if (!obj[c.id].toLowerCase) {
            continue;
          }
          if (obj[c.id]?.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
            return true;
          }
        }
      }
      return false;
    });
  }
  return stabilizedThis.map((el) => el[0]);
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: "1px",
  height: "1px",
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  clip: "rect(0 0 0 0)",
};

const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing(0, 1, 0, 3),
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(["box-shadow", "width"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  "&.Mui-focused": {
    width: 320,
    boxShadow: theme.customShadows.z8,
  },
  "& fieldset": {
    borderWidth: `1px !important`,
    borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
  },
}));

const CustomTable = ({
  // Original Props
  data,
  columns,
  checkbox = false,
  searchText,
  pagination = true,
  showFilter = false,
  mode = "light", // Default ke light mode
  extendToolbar = null,
  defaultOrder = null,
  rowAction,

  // API Search and Filter Props
  onSearch,
  categoryFilter,
  onCategoryChange,
  categories = [],
  categoryLoading = false,

  // API Pagination Props
  apiPagination = false,
  totalCount = 0,
  currentPage = 0,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPage = 10,
  loading = false,
}) => {
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("name");
  const [filterName, setFilterName] = useState("");
  const [localPage, setLocalPage] = useState(0);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(10);

  useEffect(() => {
    setFilterName(searchText || "");
  }, [searchText]);

  useEffect(() => {
    if (columns && columns.length > 0) {
      if (defaultOrder) {
        setOrderBy(defaultOrder);
      } else {
        setOrderBy(columns[0].id);
      }
    }
  }, [columns]);

  useEffect(() => {
    const debouncedSearch = debounce((searchTerm) => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300);

    debouncedSearch(filterName);

    return () => {
      debouncedSearch.cancel();
    };
  }, [filterName]);

  const handleFilterByName = (event) => {
    const searchValue = event.target.value;
    if (apiPagination) {
      // Reset to first page when searching with API pagination
      onPageChange?.(null, 0);
    } else {
      setLocalPage(0);
    }
    setFilterName(searchValue);
  };

  const handleClearSearch = () => {
    setFilterName("");
    if (apiPagination) {
      onPageChange?.(null, 0);
    } else {
      setLocalPage(0);
    }
  };

  // Use API data directly when API pagination is enabled
  const filteredData = apiPagination
    ? data
    : onSearch
    ? data
    : applySortFilter(data, getComparator(order, orderBy), filterName, columns);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const createSortHandler = (property) => (event) => {
    handleRequestSort(event, property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = data.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    if (apiPagination) {
      onPageChange?.(event, newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);

    if (apiPagination) {
      onRowsPerPageChange?.(event);
      onPageChange?.(null, 0); // Reset to first page
    } else {
      setLocalPage(0);
      setLocalRowsPerPage(newRowsPerPage);
    }
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const emptyRows = apiPagination
    ? 0 // API handles data slicing
    : localPage > 0
    ? Math.max(0, (1 + localPage) * localRowsPerPage - data.length)
    : 0;

  const isNotFound = !filteredData.length && !!filterName;

  // Use appropriate values for pagination
  const currentPageValue = apiPagination ? currentPage : localPage;
  const currentRowsPerPage = apiPagination ? rowsPerPage : localRowsPerPage;
  const totalCountValue = apiPagination ? totalCount : data.length;

  return (
    <>
      {showFilter && (
        <ListTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
          extendToolbar={extendToolbar}
          categoryFilter={categoryFilter}
          onCategoryChange={onCategoryChange}
          categories={categories}
          categoryLoading={categoryLoading}
        />
      )}

      <TableContainer 
        sx={{ 
          minWidth: 0, 
          fontFamily: "Open Sans",
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
          border: '1px solid #f0f0f0',
        }}
      >
        {/* Search Bar */}
        {onSearch && !showFilter && (
          <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
            <OutlinedInput
              placeholder="Search..."
              value={filterName}
              onChange={handleFilterByName}
              fullWidth
              size="small"
              startAdornment={<SearchIcon sx={{ color: '#666', mr: 1 }} />}
              endAdornment={
                filterName && (
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    sx={{ mr: -1 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )
              }
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#ddd',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#004EEB',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#004EEB',
                  borderWidth: '1px',
                },
              }}
            />
          </Box>
        )}

        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fafafa' }}>
              {checkbox && (
                <TableCell 
                  padding="checkbox"
                  sx={{ 
                    borderBottom: '1px solid #f0f0f0',
                    color: '#333',
                    fontWeight: 600,
                  }}
                >
                  <Checkbox
                    indeterminate={
                      selected.length > 0 && selected.length < data.length
                    }
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAllClick}
                    sx={{
                      color: '#ddd',
                      '&.Mui-checked': {
                        color: '#004EEB',
                      },
                    }}
                  />
                </TableCell>
              )}
              {columns.map((headCell) => (
                <TableCell
                  width={headCell?.width}
                  sx={{ 
                    color: '#333',
                    fontWeight: 600,
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '14px',
                    py: 2,
                  }}
                  scope="row"
                  component={"th"}
                  key={headCell.id}
                  align={headCell.alignment ? headCell.alignment : "left"}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    sx={{
                      color: '#333 !important',
                      fontWeight: 600,
                      cursor:
                        headCell.allowSort || headCell.allowSort === undefined
                          ? "pointer"
                          : "auto",
                      '&:hover': {
                        color: '#004EEB !important',
                      },
                      '&.Mui-active': {
                        color: '#004EEB !important',
                      },
                    }}
                    hideSortIcon={false}
                    active={
                      orderBy === headCell.id && headCell.allowSort !== false
                    }
                    direction={orderBy === headCell.id ? order : "asc"}
                    onClick={(e) => {
                      if (
                        headCell.allowSort ||
                        headCell.allowSort === undefined
                      ) {
                        createSortHandler(headCell.id)(e);
                      }
                    }}
                    IconComponent={(props) => (
                      <Box
                        component="span"
                        sx={{
                          ...props.style,
                          color: orderBy === headCell.id ? '#004EEB' : '#999',
                          '&:hover': {
                            color: '#004EEB',
                          },
                        }}
                      >
                        {props.children}
                      </Box>
                    )}
                  >
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <Box sx={{ ...visuallyHidden }}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (checkbox ? 1 : 0)}
                  align="center"
                  sx={{ py: 4, color: '#666' }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box sx={{ width: 20, height: 20, mr: 2 }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          border: '2px solid #004EEB',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                          },
                        }}
                      />
                    </Box>
                    Loading...
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              (apiPagination
                ? filteredData
                : filteredData.slice(
                    currentPageValue * currentRowsPerPage,
                    currentPageValue * currentRowsPerPage + currentRowsPerPage
                  )
              ).map((row, key) => {
                const { id } = row;
                const selectedItem = selected.indexOf(id) !== -1;

                return (
                  <TableRow
                    hover
                    key={id}
                    tabIndex={-1}
                    role="checkbox"
                    selected={selectedItem}
                    sx={{
                      cursor: rowAction?.onClick ? "pointer" : "default",
                      backgroundColor: selectedItem ? 'rgba(0, 78, 235, 0.04)' : 'inherit',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 78, 235, 0.04)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 78, 235, 0.08)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 78, 235, 0.12)',
                        },
                      },
                    }}
                  >
                    {checkbox && (
                      <TableCell 
                        padding="checkbox"
                        sx={{ borderBottom: '1px solid #f0f0f0' }}
                      >
                        <Checkbox
                          checked={selectedItem}
                          onChange={(event) => handleClick(event, id)}
                          sx={{
                            color: '#ddd',
                            '&.Mui-checked': {
                              color: '#004EEB',
                            },
                          }}
                        />
                      </TableCell>
                    )}

                    {columns.map((columnSetting, key) => {
                      return (
                        <TableCell
                          key={key}
                          sx={{
                            color: '#333',
                            borderBottom: '1px solid #f0f0f0',
                            fontSize: '14px',
                            py: 1.5,
                            '&:hover': columnSetting.link ? {
                              color: '#004EEB',
                              textDecoration: 'underline',
                            } : {},
                          }}
                          onClick={
                            columnSetting.link
                              ? () => rowAction?.onClick(row)
                              : null
                          }
                          align={columnSetting.alignment}
                        >
                          {columnSetting.render
                            ? columnSetting.render(row)
                            : row[columnSetting.id]
                            ? row[columnSetting.id]
                            : "-"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
            {!apiPagination && emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={columns.length + (checkbox ? 1 : 0)} />
              </TableRow>
            )}
          </TableBody>

          {isNotFound && (
            <TableBody>
              <TableRow>
                <TableCell align="center" colSpan={columns.length + (checkbox ? 1 : 0)} sx={{ py: 4 }}>
                  <Paper
                    sx={{
                      textAlign: "center",
                      backgroundColor: "transparent",
                      fontFamily: "Open Sans",
                      p: 3,
                      border: '1px dashed #ddd',
                      borderRadius: '8px',
                    }}
                  >
                    <SearchIcon 
                      sx={{ 
                        fontSize: 48, 
                        color: '#999',
                        mb: 2 
                      }} 
                    />
                    <Typography variant="h6" paragraph sx={{ color: '#333', fontWeight: 600 }}>
                      Data Tidak Ditemukan
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Tidak ada data ditemukan untuk &nbsp;
                      <strong style={{ color: '#004EEB' }}>&quot;{filterName}&quot;</strong>.
                      <br /> Coba dengan kata kunci lain.
                    </Typography>
                  </Paper>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalCountValue}
          rowsPerPage={currentRowsPerPage}
          page={currentPageValue}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            color: '#333',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #f0f0f0',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              color: '#333',
              fontSize: '14px',
            },
            '& .MuiTablePagination-actions button': {
              color: '#333',
              '&:hover': {
                backgroundColor: 'rgba(0, 78, 235, 0.04)',
              },
              '&.Mui-disabled': {
                color: '#999',
              },
            },
            '& .MuiSelect-select': {
              color: '#333',
              fontSize: '14px',
            },
            '& .MuiInputBase-root': {
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#004EEB',
                },
              },
            },
          }}
          slotProps={{
            select: {
              sx: {
                '& .MuiSelect-icon': {
                  color: '#333',
                },
                '&:hover .MuiSelect-icon': {
                  color: '#004EEB',
                },
              },
            },
          }}
        />
      )}
    </>
  );
};

export default CustomTable;