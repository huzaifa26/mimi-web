import React, { Fragment, useEffect, useMemo, useState } from "react";
import { TableCell, makeStyles, Box } from "@material-ui/core";
import { FormattedMessage } from "react-intl";
import {
  AddIcon,
  SearchBar,
  Button,
  Loader,
  SimpleModal,
  Links,
  MenuSingle,
  DataTable,
  Status,
} from "../../components";
import { db } from "../../utils/firebase";
import { useStore } from "../../store";
import { usePagination } from "../../hooks/usePaginaton";

import {
  getPageStyles,
  getSectionHeaderStyles,
  getTypographyStyles,
  searchBy,
} from "../../utils/helpers";
import { ROLES } from "../../utils/constants";

import { CreateStoreBody } from "./modals/createStore";
import { StoreDetailsBody } from "./modals/storeDetails";
import clsx from "clsx";

const headers = [
  {
    id: `STORE_NAME`,
  },
  {
    id: `STATUS`,
  },
  {
    id: `TOTAL_PRODUCTS`,
  },
];

const options = [
  {
    id: null,
    label: <FormattedMessage id={"all"} />,
  },
  {
    id: true,
    label: <FormattedMessage id={"active"} />,
  },
  {
    id: false,
    label: <FormattedMessage id={"disabled"} />,
  },
];

export const Store = React.memo(() => {
  const classes = useStyles();

  const { state: storeState } = useStore();
  const { user, orientation, defaultAvatars } = storeState;

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState();
  const [searchText, setSearchText] = useState("");
  const [modalStates, setModalStates] = useState({
    newStore: false,
    storeDetail: false,
  });
  const [status, setStatus] = useState({
    id: null,
    label: <FormattedMessage id={"all"} />,
  });

  const query = useMemo(() => {
    const baseQuery = db
      .collection("Institution")
      .doc(user._code)
      .collection("store")
      .orderBy("id");
    if (typeof status.id !== "boolean" && !status.id) return baseQuery;
    return baseQuery.where("status", "==", status.id);
  }, [status]);

  const { data, loading, loadMore, hasMore } = usePagination(
    query,
    (list) => {
      if (user.type === ROLES.admin) {
        return list;
      } else {
        return list.filter((el) => {
          if (el.access.length === 0) return true;
          if (el.group_access.some((id) => user.group_ids.includes(id)))
            return true;
          return false;
        });
      }
    },
    (list) => {
      if (typeof status.id === "boolean") return list;

      // default sort

      return list.sort((a, b) => {
        const first = Boolean(a.status);
        const second = Boolean(b.status);

        if (first) {
          return -1;
        }
        if (!second) {
          return 1;
        }

        return 0;
      });
    }
  );

  const closeNewStore = () => {
    setModalStates((prev) => ({ ...prev, newStore: false }));
  };

  const closeStoreDetail = () => {
    setModalStates((prev) => ({ ...prev, storeDetail: false }));
    setSelectedStore(null);
  };

  useEffect(() => {
    if (searchText) {
      setStores(searchBy(data, ["store_name"], searchText));
    } else {
      setStores(data);
    }
  }, [searchText, data]);


  const updateOnAdding = async() => {
    var updateData = []
   await db.collection("Institution")
      .doc(user._code)
      .collection("store")
      .orderBy("id").get()
      .then((querySnapshot)=>{
          querySnapshot.forEach((doc)=>{
              updateData.push(doc.data())
              })
      })
      .catch((error)=>{
        alert(error)
      })

      setStores(updateData)
  }
  const links = [
    {
      ref: "/store",
      title: <FormattedMessage id="store" />,
    },
  ];

  const renderLabel = (status) => {
    return (
      <Box display={"flex"} alignItems="center">
        <FormattedMessage id="show" />
        <Box marginRight={0.5}>:</Box>
        {status.label}
      </Box>
    );
  };
  const renderItem = (store) => {
    return (
      <Fragment>
        <TableCell>{store.store_name}</TableCell>
        <TableCell>
          <Status value={store.status} />
        </TableCell>
        <TableCell>{store.numberOfProducts}</TableCell>
      </Fragment>
    );
  };

  const actionBar = (
    <div className={classes.default_headerSection_container}>
      <div className={classes.default_headerSection_pageTitle}>
        <Links links={links} />
      </div>
      <SearchBar
        placeholder={`Search by names`}
        size={"small"}
        handleSearch={(value) => setSearchText(value)}
      />
      <div className={classes.default_headerSection_actionsContainer}>
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            setModalStates((prev) => ({ ...prev, newStore: true }));
          }}
        >
          <FormattedMessage id="add_new_store" />
        </Button>

        <MenuSingle
          list={options}
          label={renderLabel(status)}
          handleChange={(value) => setStatus(value)}
          defaultValue={status}
        />
      </div>
    </div>
  );

  const tableProps = {
    data: stores,
    renderItem,
    headers,
    loadMore,
    handleRowClick: (store) => {
      setSelectedStore(store);
      setModalStates((prev) => ({ ...prev, storeDetail: true }));
    },
  };

  return loading ? (
    <Loader />
  ) : (
    <section
      className={clsx([classes.default_page_root, classes.default_page_Bg1])}
    >
      <SimpleModal
        title={<FormattedMessage id="add_new_store" />}
        open={modalStates.newStore}
        handleClose={closeNewStore}
      >
        <CreateStoreBody handleClose={closeNewStore} update={updateOnAdding}/>
      </SimpleModal>
      <SimpleModal
        extended
        title={<FormattedMessage id="store_details" />}
        open={modalStates.storeDetail}
        handleClose={closeStoreDetail}
      >
        <StoreDetailsBody
          storeId={selectedStore?.id}
          handleClose={closeStoreDetail}
        />
      </SimpleModal>
      {actionBar}

      <DataTable {...tableProps} />
    </section>
  );
});

const useStyles = makeStyles((theme) => {
  return {
    ...getSectionHeaderStyles(theme),
    ...getPageStyles(theme),
  };
});
