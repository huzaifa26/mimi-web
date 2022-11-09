import React, { useState, useEffect } from "react";
import { Button } from "./";
import Icon, { TickIcon } from "./Icons";
import { Menu, MenuItem, makeStyles, Box } from "@material-ui/core";
import clsx from "clsx";
import ScrollArea from "react-scrollbar";

const useStyles = makeStyles((theme) => {
  return {
    item: {
      color: "#808191",
      textTransform: "capitalize",
    },
    selected: {
      color: `#685BE7`,
    },
    button: {
      fontWeight: "bold",
      color: "#000",
      backgroundColor: "#8F92A10D",
      "&:hover": {
        backgroundColor: "#8F92A10D",
      },
    },
  };
});

export const MenuSingle = React.memo((props) => {
  const classes = useStyles();

  const { label, list, handleChange, defaultValue, btnProps } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const [selected, setSelected] = useState();

  useEffect(() => {
    if (defaultValue) {
      const option = list.find((el) => el.id == defaultValue.id);

      setSelected(option);
    }
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        className={classes.button}
        {...(btnProps || {})}
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <Box display="flex" alignItems="center">
          {label}
          {Icon.dropDownMenu}
        </Box>
      </Button>

      <Menu
        PaperProps={{
          style: {
            borderRadius: 10,
            maxHeight: 300,
            minWidth: 150,
          },
        }}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => handleClose()}
      >
        {list.map((el) => (
          <MenuItem
            className={clsx({
              [classes.item]: true,
              [classes.selected]: selected?.id == el.id,
            })}
            onClick={() => {
              setSelected(el);
              handleChange(el);
              handleClose();
            }}
          >
            {el.label || el.name}

            {selected?.id == el.id && (
              <TickIcon
                style={{
                  marginLeft: 10,
                }}
                fontSize="small"
              />
            )}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
});