import {
  alpha,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@material-ui/core";

import clsx from "clsx";
import ScrollArea from "react-scrollbar";
import React, { Fragment, useRef, useState, useEffect, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { useInView } from "react-intersection-observer";
import { Button } from ".";
import Icons, { UpIcon, DownIcon } from "./Icons";
import { Loader } from "./loader";
import { useStore } from "../store";

const useStyles = makeStyles((theme) => {
  return {
    scrollArea: {},
    scrollAreaContent: {},
    table: {
      background: "#fff",
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
    },
    tableHeadRow: {
      background: alpha(`#8F92A1`, 0.15),

      "&.ltr": {
        "& $tableHeadCell:first-of-type": {
          borderRadius: 0,
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
        },
        "& $tableHeadCell:last-of-type": {
          borderRadius: 0,
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
        },
      },

      "&.rtl": {
        "& $tableHeadCell:first-of-type": {
          borderRadius: 0,
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
        },
        "& $tableHeadCell:last-of-type": {
          borderRadius: 0,
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
        },
      },
    },
    tableHeadCell: {
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: "#808191",
      fontWeight: 600,
      border: "none",
      textAlign: theme.direction === "ltr" ? "left" : "right",
    },
    tableBody: {},
    tableBodyRow: {
      "& .MuiTableCell-root": {
        borderBottom: "1px solid #F4F4F6",
        textAlign: theme.direction === "ltr" ? "left" : "right",
      },
    },
    buttonContainer: {
      padding: 10,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },

    hidden: {
      visibility: "hidden ",
    },

    warning: {
      fontSize: 20,
      fontWeight: 400,
    },
    fitContent: {
      width: 50,
    },
    pointer: {
      cursor: "pointer",
    },
  };
});

export const DataTable = React.forwardRef((props, ref) => {
  const classes = useStyles();

  const { state: storeState } = useStore();
  const { user } = storeState;

  const { orientation } = storeState;

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [sortDirection, setSortDirection] = useState("desc");
  const [sortDirectionCol, setSortDirectionCol] = useState("");
  const [defaultColSortFirst, setdefaultColSortFirst] = useState(true);
  const counterRef = useRef(1);

  const {
    ref: observerRef,
    inView,
    entry,
  } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  const {
    headers,
    data,
    renderItem,
    loadMore,
    tableProps,
    handleRowClick,
    handleGroups,
  } = props;

  const onClick = async () => {
    setLoading(true);
    await loadMore();
    counterRef.current += 1;
    setLoading(false);
  };
  useMemo(() => {
    setTableData(data);
  }, [data]);

  if (typeof data === "undefined") return <Loader />;

  if (!data.length)
    return (
      <Typography className={classes.warning}>
        <FormattedMessage id={"no_records"} />
      </Typography>
    );

  const sortData = (headerColValue) => {
    setdefaultColSortFirst(false);
    setSortDirectionCol(headerColValue);

    if (sortDirection === "asc") {
      setTableData(data.sort((a, b) => (a.kids_ids > b.kids_ids ? 1 : -1)));
      setSortDirection("desc");
    } else {
      setTableData(data.sort((a, b) => (a.kids_ids < b.kids_ids ? 1 : -1)));
      setSortDirection("asc");
    }
  };
  return (
    <Fragment>
      <ScrollArea
        horizontal
        vertical
        contentClassName={classes.scrollAreaContent}
        className={classes.scrollArea}
        smoothScrolling
        ref={ref}
      >
        <Table
          className={classes.table}
          {...(tableProps || {})}
          aria-label="custom pagination table"
        >
          <TableHead>
            <TableRow className={clsx([classes.tableHeadRow, orientation])}>
              {headers.map((el, index) => {
                return (
                  <TableCell
                    key={el.id}
                    className={clsx({
                      [classes.tableHeadCell]: true,
                      [classes.fitContent]: !String(el.id).trim(),
                    })}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      sortData(el.id);
                    }}
                  >
                    <FormattedMessage id={el.id} />
                    {sortDirectionCol === el.id ? (
                      sortDirection === "asc" ? (
                        <>
                          <UpIcon fontSize="small" />
                        </>
                      ) : (
                        <>
                          <DownIcon fontSize="small" />
                        </>
                      )
                    ) : defaultColSortFirst === true && index === 0 ? (
                      sortDirection === "asc" ? (
                        <>
                          <UpIcon fontSize="small" />
                        </>
                      ) : (
                        <>
                          <DownIcon fontSize="small" />
                        </>
                      )
                    ) : null}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody className={classes.tableBody}>
            {tableData.map((el) => (
              <TableRow
                key={el.id}
                innerRef={observerRef}
                className={clsx({
                  [classes.tableBodyRow]: true,
                  [classes.pointer]: !!handleRowClick,
                })}
                onClick={() => handleRowClick && handleRowClick(el)}
              >
                {renderItem(el)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <div
        className={clsx({
          [classes.buttonContainer]: true,
          [classes.hidden]: !(loadMore && inView),
        })}
      >
        <Button
          disable={loading}
          loading={loading}
          endIcon={Icons.loadMore}
          onClick={onClick}
        >
          <FormattedMessage id="load_more" />
        </Button>
      </div>
    </Fragment>
  );
});
