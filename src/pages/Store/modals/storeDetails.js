import {
  Box,
  Grid,
  makeStyles,
  TableCell,
  Typography,
} from "@material-ui/core";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  Button,
  SearchBar,
  SimpleModal,
  DataTable,
  Loader,
} from "../../../components";
import Icons, {
  AddIconSim,
  Delete,
  Edit,
  Pause,
  Active,
} from "../../../components/Icons";
import StoreIcon from "../../../assets/icons/StoreIcon.png";
import { useStore, useUi } from "../../../store";
import { db } from "../../../utils/firebase";
import {
  getModalStyles,
  getSectionHeaderStyles,
  getTypographyStyles,
  searchBy,
} from "../../../utils/helpers";
import { PERMISSIONS } from "../../../utils/constants";
import Key from "../../../assets/icons/key.png";
import clsx from "clsx";

import { ManageAccessBody } from "./manageAccess";
import { EditStoreBody } from "./editStore";
import { ProductBody } from "./product";

const useStyles = makeStyles((theme) => {
  return {
    ...getTypographyStyles(theme),
    ...getSectionHeaderStyles(theme),
    ...getModalStyles(theme),
    active: {
      color: `#4FBF67`,
    },
    deleteButton: {
      background: `#FF4031 !important`,
    },
  };
});

const headers = [
  {
    id: `name`,
  },
  {
    id: `quantity`,
  },
  {
    id: `price`,
  },
  {
    id: `action`,
  },
];

export const StoreDetailsBody = (props) => {
  const { handleClose, storeId } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user } = storeState;

  const listenerRef = useRef([]);

  const [searchText, setSearchText] = useState("");

  const [store, setStore] = useState();
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState();

  useEffect(() => {
    if (!storeId) return;
    listenerRef.current.push(
      db
        .collection("Institution")
        .doc(user._code)
        .collection("store")
        .doc(storeId)
        .onSnapshot((snapshot) => {
          setStore(snapshot.data());
        })
    );

    return () => {
      listenerRef.current.length && listenerRef.current.forEach((el) => el());
    };
  }, [storeId]);

  useEffect(() => {
    if (!store?.id) return;

    listenerRef.current.push(
      db
        .collection("Institution")
        .doc(user._code)
        .collection("store")
        .doc(store.id)
        .collection("products")
        .onSnapshot(async (snapshot) => {
          setData(snapshot.docs.map((el) => el.data()));
        })
    );
  }, [store?.id]);

  useEffect(() => {
    if (searchText) {
      setProducts(searchBy(data, ["name"], searchText));
    } else {
      setProducts(data);
    }
  }, [searchText, data]);

  const [modalStates, setModalStates] = useState({
    product: false,
    manageAccess: false,
    editStore: false,
  });

  const closeProduct = () => {
    setModalStates((prev) => ({ ...prev, product: false }));
  };

  const closeManageAccess = () => {
    setModalStates((prev) => ({ ...prev, manageAccess: false }));
  };
  const closeEditStore = () => {
    setModalStates((prev) => ({ ...prev, editStore: false }));
  };

  const deleteProduct = async (product) => {
    if (!user.permissions[PERMISSIONS.storeAccess]) {
      return actions.alert("You don't have access to perform this action");
    }

    const action = async () => {
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("store")
        .doc(store.id)
        .collection("products")
        .doc(product.id)
        .delete();

      await db
        .collection("Institution")
        .doc(user._code)
        .collection("store")
        .doc(store.id)
        .update({
          numberOfProducts: store.numberOfProducts - 1,
        });
    };

    actions.showDialog({
      action,
      title: `Delete ${product.name}?`,
      body: "Are you sure you want to delete? it cannot be undone",
    });
  };

  const deleteStore = async () => {
    if (!user.permissions[PERMISSIONS.trackAccess]) {
      return actions.alert("You don't have access to perform this action");
    }

    const action = async () => {
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("store")
        .doc(store.id)
        .delete();
      handleClose();
    };

    actions.showDialog({
      action,
      title: `Delete ${store.store_name}?`,
      body: "Are you sure you want to delete? it cannot be undone",
    });
  };

  const handleStatus = async () => {
    if (!user.permissions[PERMISSIONS.trackAccess]) {
      return actions.alert("You don't have access to perform this action");
    }

    await db
      .collection("Institution")
      .doc(user._code)
      .collection("store")
      .doc(store.id)
      .update({
        status: !store.status,
      });
  };

  const renderStatus = (status) => {
    if (status) {
      return (
        <Typography
          className={clsx(
            classes.default_typography_subHeading,
            classes.default_typography_colorSuccess,
            classes.default_typography_bold,
            classes.default_typography_capitalize
          )}
        >
          <FormattedMessage id={"active"} />
        </Typography>
      );
    } else {
      return (
        <Typography
          className={clsx([
            classes.default_typography_subHeading,
            classes.default_typography_colorFailure,
            classes.default_typography_bold,
            classes.default_typography_capitalize,
          ])}
        >
          <FormattedMessage id={"disabled"} />
        </Typography>
      );
    }
  };

  const renderItem = (product) => {
    return (
      <Fragment>
        <TableCell>{product.name}</TableCell>
        <TableCell>{product.quantity}</TableCell>
        <TableCell>{product.price}</TableCell>
        <TableCell>
          <Edit
            style={{ color: "#8F92A1", cursor: "pointer", margin:8 }}
            onClick={() => {
              setSelectedProduct(product);
              setModalStates((prev) => ({ ...prev, product: true }));
            }}
          />
          <Delete
            style={{ color: "#8F92A1", cursor: "pointer", margin:8}}
            onClick={() => deleteProduct(product)}
          />
        </TableCell>
      </Fragment>
    );
  };

  const actionBar = (
    <div className={classes.default_headerSection_container}>
      <div
        style={{
          flex: 1,
        }}
      >
        <SearchBar
          placeholder={`Search by names`}
          size={"small"}
          handleSearch={(value) => setSearchText(value)}
        />
      </div>
      <div className={classes.default_headerSection_actionsContainer}>
        <Button
          startIcon={<img src={Key} />}
          onClick={() => {
            setModalStates((prev) => ({ ...prev, manageAccess: true }));
          }}
        >
          <FormattedMessage id="manage_access" />
        </Button>
        <Button
          startIcon={<AddIconSim style={{ fontSize: 22 }} />}
          onClick={() => {
            setSelectedProduct(null);
            setModalStates((prev) => ({ ...prev, product: true }));
          }}
        >
          <FormattedMessage id="add_product" />
        </Button>
      </div>
    </div>
  );

  const tableProps = {
    data: products,
    renderItem,
    headers,
    loadMore: null,
  };

  if (!store) return <Loader />;

  return (
    <Fragment>
      <SimpleModal
        extended
        title={<FormattedMessage id="manage_access" />}
        open={modalStates.manageAccess}
        handleClose={closeManageAccess}
      >
        <ManageAccessBody store={store} handleClose={closeManageAccess} />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="edit_store" />}
        open={modalStates.editStore}
        handleClose={closeEditStore}
      >
        <EditStoreBody store={store} handleClose={closeEditStore} />
      </SimpleModal>
      <SimpleModal
        title={
          <FormattedMessage
            id={selectedProduct ? `edit_product` : `add_product`}
          />
        }
        open={modalStates.product}
        handleClose={closeProduct}
      >
        <ProductBody
          store={store}
          product={selectedProduct}
          handleClose={closeProduct}
        />
      </SimpleModal>

      <Box marginY={1}>
        <Grid container alignItems="center">
          <Grid item md={2} xs={6}>
            <img src={StoreIcon} />
          </Grid>
          <Grid item md={2} xs={6}>
            <Typography
              className={clsx(
                classes.default_typography_label,
                classes.default_typography_colorLight,
                classes.default_typography_bold
              )}
            >
              <FormattedMessage id="STORE_NAME" />
            </Typography>
            <Typography
              className={clsx(
                classes.default_typography_subHeading,
                classes.default_typography_colorDark,
                classes.default_typography_bold,
                classes.default_typography_capitalize
              )}
            >
              {store.store_name}
            </Typography>
          </Grid>
          <Grid item md={2} xs={6}>
            <Typography
              className={clsx(
                classes.default_typography_label,
                classes.default_typography_colorLight,
                classes.default_typography_bold
              )}
            >
              <FormattedMessage id="STATUS" />
            </Typography>
            <Typography
              className={clsx(
                classes.default_typography_subHeading,
                classes.default_typography_colorSuccess,
                classes.default_typography_bold,
                classes.default_typography_capitalize
              )}
            >
              {renderStatus(store.status)}
            </Typography>
          </Grid>
          <Grid item md={2} xs={6}>
            <Typography
              className={clsx(
                classes.default_typography_label,
                classes.default_typography_colorLight,
                classes.default_typography_bold
              )}
            >
              <FormattedMessage id="TOTAL_PRODUCTS" />
            </Typography>
            <Typography
              className={clsx(
                classes.default_typography_subHeading,
                classes.default_typography_colorDark,
                classes.default_typography_bold,
                classes.default_typography_capitalize
              )}
            >
              {products.length}
            </Typography>
          </Grid>
          <Grid item md={2} xs={6}>
            <Typography
              className={clsx(
                classes.default_typography_label,
                classes.default_typography_colorLight,
                classes.default_typography_bold
              )}
            >
              <FormattedMessage id="PRODUCT_LIMIT" />
            </Typography>
            <Typography
              className={clsx(
                classes.default_typography_subHeading,
                classes.default_typography_colorDark,
                classes.default_typography_bold,
                classes.default_typography_capitalize
              )}
            >
              {store.MaxProductsKidCanBuy}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {actionBar}

      <DataTable {...tableProps} />

      <div className={classes.default_modal_footer}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4} justifyContent="center">
            <Button
              fullWidth
              className={classes.default_modal_buttonSecondary}
              onClick={handleClose}
            >
              <FormattedMessage id="cancel" />
            </Button>
          </Grid>
          <Grid item xs={12} sm={4} justifyContent="center">
            <Button
              startIcon={
                <Edit style={{ color: "#8F92A1", cursor: "pointer" }} />
              }
              fullWidth
              className={classes.default_modal_buttonSecondary}
              onClick={() => {
                setModalStates((prev) => ({ ...prev, editStore: true }));
              }}
            >
              <FormattedMessage id="edit_store" />
            </Button>
          </Grid>
          <Grid item xs={12} sm={4} justifyContent="center">
            <Button
              startIcon={<Delete />}
              fullWidth
              className={classes.deleteButton}
              onClick={deleteStore}
            >
              <FormattedMessage id="delete_shop" />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};
