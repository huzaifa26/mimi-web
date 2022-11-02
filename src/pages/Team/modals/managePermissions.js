import { Checkbox, Grid, Box, makeStyles, Typography, Tooltip } from "@material-ui/core";
import clsx from "clsx";
import React, { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button } from "../../../components";
import { useStore, useUi } from "../../../store";
import { db } from "../../../utils/firebase";
import { getModalStyles, getPageStyles } from "../../../utils/helpers";
import { PERMISSIONS, ROLES } from "../../../utils/constants";
import ScrollArea from "react-scrollbar";
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

const permissionOptions = [
  {
    id: PERMISSIONS.allowAddBonus,
    label: <FormattedMessage id="allow_add_bonus" />,
    tooltip:"Allow staff to add bonus points when submitting report for kid. (App)"
  },
  {
    id: PERMISSIONS.requireScoreConfirmation,
    label: <FormattedMessage id="not_require_score_confirmation" />,
    tooltip:"Allow staff to submit report without the need to ask the kid permission to submit. (App)"
  },
  {
    id: PERMISSIONS.groupReport,
    label: <FormattedMessage id="edit_group_report" />,
    tooltip:"Allow staff to make changes to the group report. (Web)",
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.storeAccess,
    label: <FormattedMessage id="store_management" />,
    tooltip:"Allow staff to make changes to the stores that his group have access to. (Web)",
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.trackAccess,
    label: <FormattedMessage id="track_management" />,
    tooltip:"Allow staff to make changes to route plans that his group have access to. (Web)",
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.picAccess,
    label: <FormattedMessage id="enable_profile_pic" />,
    tooltip:"Allow staff to enable the option of kid to upload profile picture from the gallery. (Web)",
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.kidScore,
    label: <FormattedMessage id="kid_score" />,
    tooltip:"Allow staff to add or update the score of a kid. (Web)",
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.redeemCoupon,
    label: <FormattedMessage id="redeem_coupon" />,
    tooltip:"Allow staff to redeem coupon of kid. (Web, App)",
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.refundCoupon,
    label: <FormattedMessage id="refund_coupon" />,
    tooltip:"Allow staff to refund coupon of kid. (Web)",
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.groupScore,
    label: <FormattedMessage id="group_score" />,
    tooltip:"Allow staff to add or update the score for the whole group. (Web)",
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.groupTransFer,
    label: <FormattedMessage id="group_transfer" />,
    tooltip:"Allow staff to move kid from one group to another. (Web)",
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.assignDays,
    label: <FormattedMessage id="assign_days" />,
    tooltip:"Allow staff to change the assign days of the kid. (Web)",
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.deleteKid,
    label: <FormattedMessage id="delete_kid" />,
    tooltip:"Allow staff to delete kid. (Web)",
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.deleteGroup,
    label: <FormattedMessage id="delete_group" />,
    tooltip:"Allow staff to delete group that have no kids in it. (Web)",
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.kidSpecialReport,
    label: <FormattedMessage id="edit_kid_special_report" />,
    tooltip:"Allow staff to set and edit report of kid. (Web)",
    restrictedRoles: [ROLES.gStaff],
  },
  // {
  //   id: PERMISSIONS.kidSpecialReport,
  //   label: <FormattedMessage id="edit_kid_special_report" />,
  //   tooltip:"– Allow staff to add bonus points when submitting report for kid. (App)",
  //   restrictedRoles: [ROLES.gStaff],
  // },
  {
    id: PERMISSIONS.webPanelAccess,
    label: <FormattedMessage id="web_panel_access" />,
    tooltip:"Allow staff to login to the console.",
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.grantCouponToGroup,
    label: <FormattedMessage id="grant_coupon_to_group" />,
    tooltip:"Allow staff to grant coupon for the whole group.",
    restrictedRoles: [ROLES.gStaff],
  },
];

export const ManagePermissionsBody = (props) => {
  const { handleClose, staff } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user, defaultAvatars } = storeState;

  const [permissions, setPermissions] = useState(() => {
    const _permissions = { ...staff.permissions };
    _permissions[PERMISSIONS.requireScoreConfirmation] =
      !staff.permissions[PERMISSIONS.requireScoreConfirmation];

    return _permissions;
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    const _permissions = { ...permissions };
    _permissions[PERMISSIONS.requireScoreConfirmation] =
      !_permissions[PERMISSIONS.requireScoreConfirmation];

    db.collection("Institution")
      .doc(user._code)
      .collection("staff")
      .doc(staff.id)
      .update({
        permissions: _permissions,
      });

    setLoading(false);
    handleClose();
  };

  const handleChange = (key) => {
    const _permissions = { ...permissions };
    setPermissions((prev) => ({
      ...prev,
      [key]: !_permissions[key],
    }));
  };

  return (
    <Fragment>
      <section className={clsx([classes.default_page_root])}>
        <ScrollArea smoothScrolling speed={0.5}>
          {permissionOptions
            .filter(
              (permission) => !permission.restrictedRoles?.includes(staff.type)
            )
            .map((el) => (
              <Box display={"flex"} alignItems="center">
                <Checkbox
                  style={{
                    color: "#685BE7",
                  }}
                  checked={permissions[el.id]}
                  onClick={() => handleChange(el.id)}
                />
                <Box sx={{display:"flex",gap:"10px"}}>
                  <Typography className={classes.headerText}>
                    {el.label}
                  </Typography>
                  <Tooltip  title={el.tooltip}>
                    {/* <IconButton> */}
                      <InfoOutlinedIcon fontSize="small"/>
                    {/* </IconButton> */}
                  </Tooltip>
                </Box>
              </Box>
            ))}
        </ScrollArea>
      </section>

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
              <FormattedMessage id="update" />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};

const useStyles = makeStyles((theme) => {
  return {
    ...getPageStyles(theme),
    ...getModalStyles(theme),
  };
});
