import { Checkbox, Grid, Box, makeStyles, Typography } from "@material-ui/core";
import clsx from "clsx";
import React, { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button } from "../../../components";
import { useStore, useUi } from "../../../store";
import { db } from "../../../utils/firebase";
import { getModalStyles, getPageStyles } from "../../../utils/helpers";
import { PERMISSIONS, ROLES } from "../../../utils/constants";
import ScrollArea from "react-scrollbar";

const permissionOptions = [
  {
    id: PERMISSIONS.allowAddBonus,
    label: <FormattedMessage id="allow_add_bonus" />,
  },
  {
    id: PERMISSIONS.requireScoreConfirmation,
    label: <FormattedMessage id="not_require_score_confirmation" />,
  },
  {
    id: PERMISSIONS.groupReport,
    label: <FormattedMessage id="edit_group_report" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.storeAccess,
    label: <FormattedMessage id="store_management" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.trackAccess,
    label: <FormattedMessage id="track_management" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.picAccess,
    label: <FormattedMessage id="enable_profile_pic" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.kidScore,
    label: <FormattedMessage id="kid_score" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.redeemCoupon,
    label: <FormattedMessage id="redeem_coupon" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.refundCoupon,
    label: <FormattedMessage id="refund_coupon" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.groupScore,
    label: <FormattedMessage id="group_score" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.groupTransFer,
    label: <FormattedMessage id="group_transfer" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.assignDays,
    label: <FormattedMessage id="assign_days" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.deleteKid,
    label: <FormattedMessage id="delete_kid" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.deleteGroup,
    label: <FormattedMessage id="delete_group" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.kidSpecialReport,
    label: <FormattedMessage id="edit_kid_special_report" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.kidSpecialReport,
    label: <FormattedMessage id="edit_kid_special_report" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.webPanelAccess,
    label: <FormattedMessage id="web_panel_access" />,
    restrictedRoles: [ROLES.gStaff],
  },
  {
    id: PERMISSIONS.grantCouponToGroup,
    label: <FormattedMessage id="grant_coupon_to_group" />,
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
                <Typography className={classes.headerText}>
                  {el.label}
                </Typography>
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
