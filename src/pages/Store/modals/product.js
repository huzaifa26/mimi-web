import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Input,
  makeStyles,
} from "@material-ui/core";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Field } from "../../../components";
import { useStore, useUi } from "../../../store";
import { db } from "../../../utils/firebase";
import { getModalStyles } from "../../../utils/helpers";
import { nanoid } from "nanoid";
import * as yup from "yup";

const useStyles = makeStyles((theme) => {
  return {
    ...getModalStyles(theme),
  };
});

export const ProductBody = (props) => {
  const { handleClose, store, product } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user } = storeState;
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [unlimited, setUnlimited] = useState(false);

  const [loading, setLoading] = useState(false);

  const Schema = useMemo(() => {
    return yup.object().shape({
      name: yup.string().required().min(2).max(20),
      price: yup
        .number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .positive()
        .min(1)
        .max(6)
        .required(),
      quantity: yup
        .number()
        .transform((value) => (isNaN(value) ? -1 : value))
        .positive()
        .min(0)
        .max(9999)
        .required(),
      unlimited: yup.boolean().required(),
    });
  }, []);

  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setQuantity(product.quantity);
    setPrice(product.price);
    setUnlimited(product.unlimited);
  }, [product]);

  useEffect(() => {
    unlimited && setQuantity(0);
  }, [unlimited]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        name,
        price,
        unlimited,
        quantity,
      };

    Schema.validateSync(payload);
  
    
   
      const productId = nanoid(6);

      await db
        .collection("Institution")
        .doc(user._code)
        .collection("store")
        .doc(store.id)
        .collection("products")
        .doc(product?.id || productId)
        .set(
          {
            storeId: store.id,
            name,
            price,
            quantity: unlimited ? "unlimited" : quantity,
            unlimited: unlimited,
            image: "",
            id: product?.id || productId,
          },
          {
            merge: true,
          }
        );
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("store")
        .doc(store.id)
        .update({
          numberOfProducts: store.numberOfProducts + 1,
        });

      handleClose();
    } catch (error) {
      actions.alert(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <Field label={<FormattedMessage id="product_name" />}>
        <Input
          inputProps={{
            min: 0,
          }}
          value={name}
          className={classes.input}
          fullWidth
          size="small"
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Field label={<FormattedMessage id="quantity" />}>
            <Input
              disabled={unlimited}
              value={quantity}
              type="number"
              inputProps={{
                min: 0,
              }}
              className={classes.input}
              fullWidth
              size="small"
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </Field>
        </Grid>
        <Grid item xs={6}>
          <Field label={<FormattedMessage id="price" />}>
            <Input
              value={price}
              type="number"
              inputProps={{
                min: 0,
              }}
              className={classes.input}
              fullWidth
              size="small"
              onChange={(e) => setPrice(parseInt(e.target.value))}
            />
          </Field>
        </Grid>
      </Grid>
      <Box marginY={1}>
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
      </Box>

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
              <FormattedMessage id={product ? "edit" : "add"} />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};
