import React, { useEffect, useState } from 'react';
import { Button } from './';
import Icon from './Icons';
import { Checkbox, FormControlLabel, makeStyles, Menu, MenuItem } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const useStyles = makeStyles(theme => {
    return {
        labelContainer: {
            '& .MuiFormControlLabel-label': {
                textTransform: 'capitalize',
            },
        },
        item: {
            color: '#808191',
            textTransform: 'capitalize',
        },
        selected: {
            color: `#685BE7`,
        },
        label: {
            marginRight: 5,
            color: `#8F92A1`,
        },
        button: {
            fontWeight: 'bold',
            color: '#000',
            backgroundColor: '#8F92A10D',
            '&:hover': {
                backgroundColor: '#8F92A10D',
            },
        },
    };
});

export const MenuMultiple = React.memo(props => {
    const classes = useStyles();

    const { list, handleChange, entity, defaultSelected, prefix } = props;

    const defaultFilter = { id: '', name: `All ${entity}` };

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const [filters, setFilters] = useState([]);
    const [activeFilters, setActiveFilters] = useState([]);
    const [filtersToShow, setFiltersToShow] = useState([]);

    useEffect(() => {
        if (Array.isArray(defaultSelected)) {
            setActiveFilters(defaultSelected);
        } else {
            setActiveFilters(list);
        }
    }, [defaultSelected, list]);

    useEffect(() => {
        setFilters(list);
        // setActiveFilters(list);
        setFiltersToShow([defaultFilter, ...list]);
    }, [list]);

    //  trigger change
    useEffect(() => {
        handleChange(activeFilters);
    }, [activeFilters]);

    const isChecked = item => {
        if (!item.id) return activeFilters.length === filters.length;
        return !!activeFilters.find(el => el.id === item.id);
    };

    const hanldeFilterChange = item => {
        if (!item.id) {
            if (activeFilters.length === filters.length) {
                setActiveFilters([]);
            } else {
                setActiveFilters([...filters]);
            }
        } else {
            const exists = activeFilters.find(el => el.id === item.id);
            if (exists) {
                setActiveFilters(prev => prev.filter(el => el.id != exists.id));
            } else {
                setActiveFilters(prev => [...prev, item]);
            }
        }
    };

    const renderButtonLabel = () => {
        let label;

        if (activeFilters.length === filters.length) {
            label = defaultFilter.name
            if(defaultFilter.name === "All Groups"){
                label = <FormattedMessage id={"all_groups"}/> ;
            }else if(defaultFilter.name === "All Actions"){
                label = <FormattedMessage id={"all_actions"}/> ;
            }
        } else if (activeFilters.length == 0 && filters.length != 0) {
            label = <FormattedMessage id={"none"}/> ;
        } else if (activeFilters.length == 1 && filters.length > activeFilters.length) {
            const [_filter] = activeFilters;
            label = _filter.label;
        } else if (activeFilters.length != 0 && filters.length > activeFilters.length) {
            label = <FormattedMessage id='mixed'/>;
        }

        return label;
    };

    return (
        <div>
            <Button className={classes.button} aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                <span className={classes.label}>{prefix || <FormattedMessage id={'Show:'} />}</span>
                {renderButtonLabel()}
                {Icon.dropDownMenu}
            </Button>

            <Menu
                id="simple-menu"
                PaperProps={{
                    style: {
                        borderRadius: 10,
                        maxHeight: 300,
                        minWidth: 200,
                    },
                }}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => handleClose()}
            >
                {filtersToShow.map(el => {
                    return(
                    <MenuItem key={el.id}>
                        <FormControlLabel
                            className={classes.labelContainer}
                            control={
                                <Checkbox
                                    style={{
                                        color: '#685BE7',
                                    }}
                                    className={classes.checkbox}
                                    disableRipple
                                    checked={isChecked(el)}
                                    onChange={() => hanldeFilterChange(el)}
                                />
                            }
                            label={el.label || el.name}
                        />
                    </MenuItem>
                )})}
            </Menu>
        </div>
    );
});
