import PropTypes from 'prop-types';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Toolbar, Tooltip, IconButton, Typography, OutlinedInput, InputAdornment, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import {Icon} from "@iconify/react";
import Palette from 'utils/Palette';


// component

// ----------------------------------------------------------------------

const StyledRoot = styled(Toolbar)(({ theme }) => ({
    height: 46,
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1, 0, 3),
}));

const StyledRootSmall = styled(Toolbar)(({ theme }) => ({
    height: 46,
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1, 0, 3),
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  height: "2.75em",
  width: "50%",
  transition: theme.transitions.create(["box-shadow", "width"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  "&.Mui-focused": {
    width: "50%",
  },
  "& fieldset": {
    borderWidth: `1px !important`,
    // borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
    borderColor: `#2f2f2f !important`,
  },
    color:'#ffffff',
    background:'#2f2f2f'
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 200,
  // Change label text color in Input 
  '& .MuiInputLabel-root': {
    color: '#CCCCCC', 
    '&.Mui-focused': {
      color: '#CCCCCC', 
    },
    '&.MuiInputLabel-shrink': {
      color: '#CCCCCC',
    },
  },
  '& .MuiOutlinedInput-root': {
    height: '2.75em',
    color: '#e0e0e0',
    background: '#2f2f2f',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#2f2f2f',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4f4f4f',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
       borderColor: '#4f4f4f',
    },
  },
  '& .MuiSelect-icon': {
    color: '#ffffff',
  }


}));


const StyledMenuProps = {
  PaperProps: {
    style: {
      maxHeight: 48 * 4.5 + 8,
      width: 250,
      backgroundColor: '#2f2f2f',
      color: '#CCCCCC', 
    },
  },
  sx: {
    // Style dropdown and checkbox
    '& .MuiMenuItem-root': {
      color: '#CCCCCC',
      '&.Mui-selected': {
        backgroundColor: `${Palette.MAIN_THEME}20`,
      },
      '&.Mui-selected:hover': {
        backgroundColor: `${Palette.MAIN_THEME}30`,
      },
    },
    '& .MuiCheckbox-root': {
      color: '#CCCCCC',
    },
    '& .MuiCheckbox-colorPrimary.Mui-checked': {
      color: Palette.MAIN_THEME,
    },
  },
};


// ----------------------------------------------------------------------

ListTableToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  categoryFilter: PropTypes.array,
  onCategoryChange: PropTypes.func,
  categories: PropTypes.array,
};

export default function ListTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  placeholder,
  size,
  extendToolbar,
  categoryFilter = [],
  onCategoryChange,
  categories = [],
  categoryLoading = false,
}) {
  return (
    <StyledRoot
      sx={{
        ...(numSelected > 0 && {
          color: "primary.main",
          bgcolor: "primary.lighter",
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <>
          <StyledSearch
            size={"medium"}
            value={filterName}
            onChange={onFilterName}
            placeholder={"Input search keyword"}
            startAdornment={
              <InputAdornment position="start">
                <Icon
                  icon="eva:search-fill"
                  sx={{ color: "text.disabled", width: 20, height: 20 }}
                />
              </InputAdornment>
            }
          />

          {/* Multiple Category Filter with Checkboxes */}
          {onCategoryChange && (
            <StyledFormControl>
              <InputLabel id="category-multiple-checkbox-label">
                Categories
              </InputLabel>
              <Select
                labelId="category-multiple-checkbox-label"
                multiple
                value={categoryFilter}
                onChange={onCategoryChange}
                input={<OutlinedInput label="Categories" />}
                renderValue={(selected) => {
                  if (categoryLoading) {
                    return "Loading categories...";
                  }
                  const selectedNames = categories
                    .filter((cat) => selected.includes(cat.id))
                    .map((cat) => cat.name);
                  return selectedNames.join(", ");
                }}
                MenuProps={StyledMenuProps}
                disabled={categoryLoading}
              >
                {categoryLoading ? (
                  <MenuItem disabled>
                    <ListItemText primary="Loading categories..." />
                  </MenuItem>
                ) : (
                  categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Checkbox checked={categoryFilter.includes(category.id)} />
                      <ListItemText primary={category.name} />
                    </MenuItem>
                  ))
                )}
              </Select>
            </StyledFormControl>
          )}
        </>
      )}
    </StyledRoot>
  );
}