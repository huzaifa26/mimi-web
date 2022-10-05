import {
  Checkbox,
  FormControlLabel,
  Grid,
  Input,
  makeStyles,
} from "@material-ui/core";
import React, { Fragment, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Field, MenuSingle, Status } from "../../../components";
import { useStore, useUi } from "../../../store";
import { db } from "../../../utils/firebase";
import { getModalStyles } from "../../../utils/helpers";
import { nanoid } from "nanoid";
import * as yup from "yup";

const useStyles = makeStyles((theme) => {
  return { ...getModalStyles(theme) };
});

const options = [
  {
    id: true,
    label: "Active",
  },
  {
    id: false,
    label: "Disabled",
  },
];

export const EditStoreBody = (props) => {
  const { handleClose, store } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user } = storeState;

  const Schema = useMemo(() => {
    return yup.object().shape({
      name: yup.string().required().min(2),
      status: yup.boolean().required(),
    });
  }, []);

  const [storeName, setStoreName] = useState(store.store_name);
  const [limit, setLimit] = useState(store.MaxProductsKidCanBuy);
  const [unlimited, setUnlimited] = useState(store.isUnlimited);
  const [status, setStatus] = useState(store.status);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (unlimited) {
        setLimit(0);
      }
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("store")
        .doc(store.id)
        .update({
          store_name: storeName,
          status: status,
          MaxProductsKidCanBuy: limit,
          isUnlimited: unlimited,
        });

      setLoading(false);
      handleClose();
    } catch (error) {
      actions.alert(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <Field label={<FormattedMessage id="STORE_NAME" />}>
        <Input
          value={storeName}
          className={classes.input}
          fullWidth
          size="small"
          onChange={(e) => setStoreName(e.target.value)}
        />
      </Field>
      <Field label={<FormattedMessage id="current_status" />}>
        <MenuSingle
          list={options}
          label={<Status value={status} />}
          handleChange={(value) => setStatus(value.id)}
        />
      </Field>

      <div style={{ display: "flex" }}>
        <Field
          label={<FormattedMessage id="max_coupons_to_have_from_this_store" />}
        >
          <Input
            value={limit}
            style={{ width: 150 }}
            className={classes.input}
            fullWidth
            type="number"
            size="small"
            onChange={(e) => setLimit(e.target.value)}
            disabled={unlimited}
          />
        </Field>
        <FormControlLabel
          control={
            <Checkbox
              style={{
                color: "#685BE7",
              }}
              onChange={() => setUnlimited((prev) => !prev)}
              disableRipple
              checked={unlimited}
            />
          }
          label={<FormattedMessage id="unlimited" />}
        />
      </div>

      <div className={classes.default_modal_footer}>
        <Grid container spacing={2}>
          <Grid item xs={6} justifyContent="center">
            <Button
              fullWidth
              disable={loading}
              className={classes.default_modal_buttonSecondary}
              onClick={handleClose}
            >
              <FormattedMessage id="cancel" />
            </Button>
          </Grid>
          <Grid item xs={6} justifyContent="center">
            <Button
              loading={loading}
              fullWidth
              disable={loading}
              onClick={handleSubmit}
            >
              <FormattedMessage id="save" />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};
