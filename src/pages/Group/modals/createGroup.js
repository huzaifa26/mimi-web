import makeStyles from "@material-ui/styles/makeStyles";
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import React, { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useStore, useUi } from "../../../store";
import { Button, Field, SimpleModal } from "../../../components";
import { db } from "../../../utils/firebase";
import { FirebaseHelpers, getModalStyles } from "../../../utils/helpers";
import { FileUploadBody } from "./fileUpload";

const useStyles = makeStyles((theme) => {
  return { ...getModalStyles(theme) };
});

export const CreateGroupBody = (props) => {
  const { handleClose } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user } = storeState;
  const [name, setName] = useState("");
  const [fileUpload, setFileUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleFileModalClose = () => {
    setFileUpload(false);
  };
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const groups = await db
        .collection("Institution")
        .doc(user._code)
        .collection("groups")
        .where("name", "==", name)
        .get();
      if (!groups.empty)
        return actions.alert(
          "Group with same name already exists, Kindly choose a different name",
          "error"
        );

      await FirebaseHelpers.createGroup.execute({
        user,
        group: {
          name,
        },
      });

      // this reload is to add the new data. data was not adding without the reload. So I added this
      window.location.reload();
      //-----------------------

      handleClose();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <SimpleModal
        extended
        title={<FormattedMessage id="upload_file" />}
        open={fileUpload}
        handleClose={handleFileModalClose}
      >
        <FileUploadBody handleClose={handleFileModalClose} />
      </SimpleModal>
      <Field label={<FormattedMessage id="group_name" />}>
        <Input
          fullWidth
          size="small"
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

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
              <FormattedMessage id="submit" />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};
