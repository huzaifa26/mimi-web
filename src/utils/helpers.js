import { db } from "./firebase";
import { ROLES, PERMISSIONS } from "./constants";
import firebase from "firebase/app";
import { alpha } from "@material-ui/core/styles/colorManipulator";
import md5 from "md5";
import { nanoid } from "nanoid";
import { _auth } from "../utils/firebase";
// const deleteUser = firebase.functions().httpsCallable('deleteUser');


export const FirebaseHelpers = {

  fetchAllStaffEmail : {
    query: (params) => {
 
      const { user } = params;

      let _query = db
          .collection("Institution")
          .doc(user._code)
          .collection("staff");
      
return _query;
    },
    execute: async function (params, config) {
      return (await this.query(params).get()).docs.map((el) => el.data());
    },
  },
  fetchStaff: {
    query: (params) => {
      const { user } = params;

      let _query;

      if (user.type == ROLES.admin) {
        _query = db
          .collection("Institution")
          .doc(user._code)
          .collection("staff");
      } else if (user.type == ROLES.mngr) {
        _query = db
          .collection("Institution")
          .doc(user._code)
          .collection("staff")
          .where("type", "in", [ROLES.gStaff, ROLES.crdntr, ROLES.guide]);
      } else if (user.type == ROLES.crdntr) {
        _query = db
          .collection("Institution")
          .doc(user._code)
          .collection("staff")
          .where("type", "in", [ROLES.gStaff, ROLES.guide]);
      } else if (user.type == ROLES.guide) {
        _query = db
          .collection("Institution")
          .doc(user._code)
          .collection("staff")
          .where("type", "in", [ROLES.gStaff])
          .where("group_ids", "array-contains-any", user.group_ids);
      } else if (user.type == ROLES.gStaff) {
        _query = db
          .collection("Institution")
          .doc(user._code)
          .collection("staff")
          .where("type", "in", [ROLES.gStaff])
          .where("group_ids", "array-contains-any", user.group_ids);
      }

      return _query;
    },
    execute: async function (params, config) {
      return (await this.query(params).get()).docs.map((el) => el.data());
    },
  },
  fetchSpecialKids: {
    query: (params) => {
      const { user } = params;

      let _query;

      if (user.type == ROLES.admin || user.type == ROLES.mngr) {
        _query = db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .where("has_special_program", "==", true);
      } else {
        _query = db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .where("staffId", "array-contains", user.id)
          .where("has_special_program", "==", true);
      }

      return _query;
    },
    execute: async function (params, config) {
      return (await this.query(params).get()).docs.map((el) => el.data());
    },
  },
  fetchKids: {
    query: (params) => {
      const { user } = params;
      let _query;

      if (user.type == ROLES.admin || user.type == ROLES.mngr) {
        _query = db.collection("Institution").doc(user._code).collection("kid");
      } else {
        _query = db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .where("staffId", "array-contains", user.id);
      }

      return _query;
    },
    execute: async function (params, config) {
      return (await this.query(params).get()).docs.map((el) => el.data());
    },
  },
  fetchGroups: {
    query: (params) => {
      const { user } = params;

      let _query;

      if (user.type == ROLES.admin || user.type == ROLES.mngr) {
        _query = db
          .collection("Institution")
          .doc(user._code)
          .collection("groups");
      } else {
        _query = db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .where("staffId", "array-contains", user.id);
      }

      return _query;
    },
    execute: async function (params, config) {
      return (await this.query(params).get()).docs.map((el) => el.data());
    },
  },
  createInstitution: {
    execute: async function (params, config) {
      const { user, institute } = params;

      const defaultAvatar = await db
        .collection("DefaultAvatars")
        .doc("zkMCyZ8IDunEgpqwhO2v")
        .get();
      await db
        .collection("Institution")
        .doc(institute.id)
        .set({
          name: institute.name,
          code: institute.id,
          image: institute.image,
          subscription_end_date: institute.expireDate,
          joined_date: new Date(),
          enabled: true,
          default_language: institute.language,
          percentage_to_keep_streak: 23,
          bonus_per_streak: 23,
          maximum_bonus_point: 23,
          points_for_next_level: 23,
          default_assigned_days: [true, false, true, false, true, false, false],
          list_of_institutions_invited: [],
          reference_code: institute.referenceCode,
          report_template: [],
          recordLogs: false,
          record_edit_limit: 6,
          id: institute.id,
          report_edit_limit: 6,
          has_red_points_enabled: true,
          total_red_points: 3,
          achievementSystem: true,
          defaultStaffAvatar: defaultAvatar?.data().defaultAvatars?.staffAvatar,
          defaultGroupAvatar:
            defaultAvatar?.data()?.defaultAvatars?.groupAvatar,
          defaultKidAvatar: defaultAvatar?.data()?.defaultAvatars?.kidAvatar,
        });
      const admin_ = await db.collection("admins").get();

      admin_.docs.map(async (e) => {
        await db
          .collection("Institution")
          .doc(institute.id)
          .collection("staff")
          .doc(e.data().id)
          .set({
            id: e.data().id,
            name: e.data().name,
            image: e.data().image,
            type: e.data().type,
            email: e.data().email,
            kids_access: [],
            group_ids: [],
            products_redeemed: [],
            permissions: {
              deleteGroup: true,
              assignDays: true,
              deleteKid: true,
              groupReport: true,
              groupScore: true,
              groupTransFer: true,
              kidScore: true,
              redeemCoupon: true,
              refundCoupon: true,
              kidSpecialReport: true,
              picAccess: true,
              storeAccess: true,
              trackAccess: true,
              allowAddBonus: true,
              requireScoreConfirmation: true,
              webPanelAccess: true,
              grantCouponToGroup: true,
            },
            requestingPermission: false,
            requestAccepted: false,
            requestDeclined: false,
            kidIsRequesting: false,
            isFavorite: false,
            hasAcceptedTerms: false,
            showMedal: false,
            defaultAvatar: false,
          });
      });
      //Set Basic Report
      const subject_id = nanoid(6);
      await db
        .collection("Institution")
        .doc(institute.id)
        .collection("basicReport")
        .doc(subject_id)
        .set({
          id: subject_id,
          name: "empty",
          totalPoints: Number(1),
          subSubject: [],
          hasSubSubject: false,
          obtainedPoints: 0,
        });
      //Guide Permissions
      await db
        .collection("Institution")
        .doc(institute.id)
        .collection("permissions")
        .doc(nanoid(6))
        .set({
          permissions: {
            deleteGroup: false,
            assignDays: false,
            deleteKid: false,
            groupReport: false,
            groupScore: false,
            groupTransFer: false,
            kidScore: false,
            kidSpecialReport: false,
            picAccess: false,
            redeemCoupon: true,
            refundCoupon: true,
            storeAccess: false,
            trackAccess: false,
            allowAddBonus: false,
            requireScoreConfirmation: false,
            webPanelAccess: false,
            grantCouponToGroup: false,
          },
          type: "guide",
        });
      //Manager Permissions

      await db
        .collection("Institution")
        .doc(institute.id)
        .collection("permissions")
        .doc(nanoid(6))
        .set({
          permissions: {
            deleteGroup: true,
            assignDays: true,
            deleteKid: true,
            groupReport: true,
            groupScore: true,
            groupTransFer: true,
            kidScore: true,
            kidSpecialReport: true,
            redeemCoupon: true,
            refundCoupon: true,
            picAccess: true,
            storeAccess: true,
            trackAccess: true,
            allowAddBonus: true,
            requireScoreConfirmation: true,
            webPanelAccess: true,
            grantCouponToGroup: true,
          },
          type: "mngr",
        });
      //Cordinator Permissions

      await db
        .collection("Institution")
        .doc(institute.id)
        .collection("permissions")
        .doc(nanoid(6))
        .set({
          permissions: {
            deleteGroup: true,
            assignDays: true,
            deleteKid: true,
            groupReport: true,
            groupScore: true,
            groupTransFer: true,
            kidScore: true,
            redeemCoupon: true,
            refundCoupon: true,
            kidSpecialReport: true,
            picAccess: true,
            storeAccess: true,
            trackAccess: true,
            allowAddBonus: true,
            requireScoreConfirmation: true,
            webPanelAccess: true,
            grantCouponToGroup: true,
          },
          type: "crdntr",
        });
      //Admin Permissions
      await db
        .collection("Institution")
        .doc(institute.id)
        .collection("permissions")
        .doc(nanoid(6))
        .set({
          permissions: {
            deleteGroup: true,
            assignDays: true,
            deleteKid: true,
            groupReport: true,
            groupScore: true,
            groupTransFer: true,
            kidScore: true,
            redeemCoupon: true,
            refundCoupon: true,
            kidSpecialReport: true,
            picAccess: true,
            storeAccess: true,
            trackAccess: true,
            allowAddBonus: true,
            requireScoreConfirmation: true,
            webPanelAccess: true,
            grantCouponToGroup: true,
          },
          type: "admin",
        });
      await db
        .collection("Institution")
        .doc(institute.id)
        .collection("permissions")
        .doc(nanoid(6))
        .set({
          permissions: {
            allowAddBonus: true,
            requireScoreConfirmation: true,
          },
          type: "gStaff",
        });
    },
  },
  createGroup: {
    execute: async function (params, config) {
      const { user, group } = params;

      const groupId = nanoid(6);

      await db
        .collection("Institution")
        .doc(user._code)
        .collection("groups")
        .doc(groupId)
        .set({
          id: groupId,
          name: group.name,
          kids_ids: [],
          staffId: [],
          image: "",
          score: 0,
          created_date: new Date(),
          storeId: [],
          isFavorite: false,
          isSpecialReport: false,
        });

      const reports = (
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("basicReport")
          .get()
      ).docs.map((el) => el.data());

      await Promise.all(
        reports.map((e) =>
          db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .doc(groupId)
            .collection("report_templates")
            .doc(e.id)
            .set(e)
        )
      );

      if (ROLES.admin !== user.type && ROLES.mngr !== user.type) {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(groupId)
          .update({
            staffId: firebase.firestore.FieldValue.arrayUnion(user.id),
          });
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("staff")
          .doc(user.id)
          .update({
            group_ids: firebase.firestore.FieldValue.arrayUnion(groupId),
          });
      }
    },
  },
  createStaff: {
    execute: async function (params, config) {
      const { user, institute, staff } = params;

      const { name, type, email, selectedGroups, password } = staff;
      const [defaultPermissions] = (
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("permissions")
          .where("type", "==", type)
          .get()
      ).docs.map((el) => el.data());

      //throw statements
      if (type == "guide") {
        const groups = await FirebaseHelpers.fetchGroups.execute({ user });
        let _group = groups.filter((e) => e.id == selectedGroups[0].id);
        if (selectedGroups.length != 1) {
          throw "Guide cannot have two groups";
        }
        if (!_group) {
          throw "Cannot find selected group";
        }
      }

      const _staff = await _auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const staffId = _staff.user.uid;
      
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("staff")
        .doc(staffId)
        .set({
          id: staffId,
          name: name,
          image: "",
          language: institute.default_language,
          type: type,
          email: email,
          firstPasswordChanged: false,
          kids_access: [],
          group_ids: [],
          products_redeemed: [],
          date_created : new Date(),
          permissions: defaultPermissions.permissions,
          requestingPermission: false,
          requestAccepted: false,
          requestDeclined: false,
          kidIsRequesting: false,
          isFavorite: false,
          hasAcceptedTerms: false,
          showMedal: false,
          defaultAvatar: false,
        });
      if (type == "admin") {
        await db
          .collection("admins")
          .doc(staffId)
          .set({
            id: staffId,
            name: name,
            image: "",
            type: type,
            email: email,
            kids_access: [],
          
            group_ids: [],
            products_redeemed: [],
            date_created : new Date(),
            permissions: {
              deleteGroup: true,
              assignDays: true,
              deleteKid: true,
              groupReport: true,
              groupScore: true,
              groupTransFer: true,
              kidScore: true,
              redeemCoupon: true,
              refundCoupon: true,
              kidSpecialReport: true,
              picAccess: true,
              storeAccess: true,
              trackAccess: true,
              allowAddBonus: true,
              requireScoreConfirmation: true,
              redeemCoupon: true,
              refundCoupon: true,
            },
            requestingPermission: false,
            requestAccepted: false,
            requestDeclined: false,
            kidIsRequesting: false,
            isFavorite: false,
            hasAcceptedTerms: false,
            showMedal: false,
            defaultAvatar: false,
          });
        const institutions = await db.collection("Institution").get();
        institutions.docs.map(async (e) => {
          await db
            .collection("Institution")
            .doc(e.data().id)
            .collection("staff")
            .doc(staffId)
            .set({
              id: staffId,
              name: name,
              image: "",
              type: type,
              email: email,
              kids_access: [],
              group_ids: [],
              products_redeemed: [],
              date_created : new Date(),
              permissions: {
                deleteGroup: true,
                assignDays: true,
                deleteKid: true,
                groupReport: true,
                groupScore: true,
                groupTransFer: true,
                kidScore: true,
                redeemCoupon: true,
                refundCoupon: true,
                kidSpecialReport: true,
                picAccess: true,
                storeAccess: true,
                trackAccess: true,
                allowAddBonus: true,
                requireScoreConfirmation: true,
                redeemCoupon: true,
                refundCoupon: true,
              },
              requestingPermission: false,
              requestAccepted: false,
              requestDeclined: false,
              kidIsRequesting: false,
              isFavorite: false,
              hasAcceptedTerms: false,
              showMedal: false,
              defaultAvatar: false,
            });
        });
      }

      if (type != ROLES.gStaff) {
        selectedGroups.map(async (e) => {
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("staff")
            .doc(staffId)
            .update({
              group_ids: firebase.firestore.FieldValue.arrayUnion(e.id),
            });
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .doc(e.id)
            .update({
              staffId: firebase.firestore.FieldValue.arrayUnion(staffId),
            });
        });
        selectedGroups.map(async (e) => {
          e.kids_ids.map(async (el) => {
            await db
              .collection("Institution")
              .doc(user._code)
              .collection("staff")
              .doc(staffId)
              .update({
                kids_access: firebase.firestore.FieldValue.arrayUnion(el),
              });
            await db
              .collection("Institution")
              .doc(user._code)
              .collection("kid")
              .doc(el)
              .update({
                staffId: firebase.firestore.FieldValue.arrayUnion(staffId),
              });
          });
        });
      }
    },
  },
  createKid: {
    execute: async function (params, config) {
      const { user, institute, kid } = params;

      const {
        password,
        kidId,
        username,
        name,
        group,
        joinDate,
        assigned_days,
      } = kid;
      console.log(kid)
      console.log(user)
      const kidExists = await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .where("username", "==", username.toLowerCase())
        .get();

      if (!kidExists.empty) {
        throw "Kid with same name already exists, Kindly choose a different name";
      }
      const encryptedPassword = md5(password);

      await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(kidId)
        .set({
          id: kidId,
          image: "",
          name: name,
          groupName: group.name,
          username: username,
          password: encryptedPassword,
          score: 0,
          xp: 0,
          language: institute.default_language,
          groupId: group.id,
          staffId: [],
          joined_date: joinDate,
          profile_permission: false,
          assigned_days: assigned_days,
          has_special_program: false,
          route_id: "",
          firstPasswordChanged: false,
          achievements: [],
          products_owned: [],
          products_used: [],
          special_program: [],
          storeId: [],
          date_created : new Date(),
          level: 1,
          reported: false,
          reportedBy: "",
          lastReportDate: "",
          showPopUp: false,
          staffIdRequesting: "",
          currentSpecialLevel: 0,
          xpForNextLevel: institute.points_for_next_level,
          xpForPreviousLevel: 0,
          has_missing_reports: false,
          isFavorite: false,
          isSpecialFav: false,
          hasAcceptedTerms: false,
        });
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("groups")
        .doc(group.id)
        .update({
          kids_ids: firebase.firestore.FieldValue.arrayUnion(kidId),
        });

      await Promise.all(
        group.staffId.map(async (e) => {
          
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("staff")
            .doc(e)
            .update({
              kids_access: firebase.firestore.FieldValue.arrayUnion(kidId),
            });

          await db
            .collection("Institution")
            .doc(user._code)
            .collection("kid")
            .doc(kidId)
            .update({
              staffId: firebase.firestore.FieldValue.arrayUnion(e),
            });
        })
      );

      const report_templates = await db
        .collection("Institution")
        .doc(user._code)
        .collection("groups")
        .doc(group.id)
        .collection("report_templates")
        .get();
      report_templates.docs.map(async (e) => {
        const subjectId = e.data().id;
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kidId)
          .collection("achievements")
          .doc(subjectId)
          .set({
            redPoints: 0,
            streak: 0,
            subjectName: e.data().name,
            isDeleted: true,
            subject_id: subjectId,
          });
      });
    },
  },
  deleteGroup: {
    execute: async function (params, config) {
      const { user, group, history } = params;

      console.log("deleting", group);

      const staff = (
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("staff")
          .get()
      ).docs.map((el) => el.data());
      await Promise.all(
        staff.map(async (el, idx) =>
          db
            .collection("Institution")
            .doc(user._code)
            .collection("staff")
            .doc(el.id)
            .update({
              group_ids: firebase.firestore.FieldValue.arrayRemove(group.id),
            })
        )
      );

      const report_templates = (
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(group.id)
          .collection("report_templates")
          .get()
      ).docs.map((el) => el.data());

      console.log(report_templates);

      await Promise.all(
        report_templates.map(async (e) =>
          db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .doc(group.id)
            .collection("report_templates")
            .doc(e.id)
            .delete()
        )
      );
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("groups")
        .doc(group.id)
        .delete();

      history.push("/groups");
    },
  },
  deleteStaff: {
    execute: async function (params, config) {
      console.log(params)
      const { staff, user } = params;
      await firebase.functions().httpsCallable('deleteUser')(staff)
      .then(()=>{
       alert("Success Alert! Staff is deleted :)")
      })
      .catch((error)=>{
        alert(error)
      })
      const groups = (  
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .get()
      ).docs.map((el) => el.data());

      await Promise.all(
        groups.map((group) =>
          db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .doc(group.id)
            .update({
              staffId: firebase.firestore.FieldValue.arrayRemove(staff.id),
            })
        )
      );

      const kids = (
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .get()
      ).docs.map((el) => el.data());

      await Promise.all(
        kids.map((kid) =>
          db
            .collection("Institution")
            .doc(user._code)
            .collection("kid")
            .doc(kid.id)
            .update({
              staffId: firebase.firestore.FieldValue.arrayRemove(staff.id),
            })
        )
      );

      await db
        .collection("Institution")
        .doc(user._code)
        .collection("staff")
        .doc(staff.id)
        .delete();
    },
    

    
  },
  deleteKid: {
    execute: async function (params, config) {
      const { kid, user, history } = params;

      const stores = await db
        .collection("Institution")
        .doc(user._code)
        .collection("store")
        .get();

      stores.docs.map(async (e, idx) => {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("store")
          .doc(e.data().id)
          .update({
            access: firebase.firestore.FieldValue.arrayRemove(kid.id),
          });
      });

      const routes = await db
        .collection("Institution")
        .doc(user._code)
        .collection("routePlan")
        .get();

      routes.docs.map(async (e, idx) => {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("routePlan")
          .doc(e.data().id)
          .update({
            kids: firebase.firestore.FieldValue.arrayRemove(kid.id),
          });
      });

      const staff_ = await db
        .collection("Institution")
        .doc(user._code)
        .collection("staff")
        .get();

      staff_.docs.map(async (e, idx) => {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("staff")
          .doc(e.data().id)
          .update({
            kids_access: firebase.firestore.FieldValue.arrayRemove(kid.id),
          });
      });
      const groups = await db
        .collection("Institution")
        .doc(user._code)
        .collection("groups")
        .get();

      groups.docs.map(async (e, idx) => {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("groups")
          .doc(e.data().id)
          .update({
            kids_ids: firebase.firestore.FieldValue.arrayRemove(kid.id),
          });
      });

      const levels = await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(kid.id)
        .collection("levels")
        .get();
      levels.docs.map(async (e) => {
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id)
          .collection("levels")
          .doc(e.data().id)
          .delete();
      });

      const achievements = await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(kid.id)
        .collection("achievements")
        .get();
      await Promise.all(
        achievements.docs.map(async (e) => {
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("kid")
            .doc(kid.id)
            .collection("achievements")
            .doc(e.data().subject_id)
            .delete();
        })
      );
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(kid.id)
        .delete();
      history.push("/kids");
    },
  },

  enableKidProfilePicture: {
    execute: async function (params, config) {
      const { user, kid } = params;

      console.log(kid.profile_permission);

      await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(kid.id)
        .update({
          profile_permission: !kid.profile_permission,
        });
    },
  },
};

export const getActionBarStyles = (theme) => {
  const baseStyles = {
    container: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      "& > *": {
        marginBottom: 10,
      },

      [theme.breakpoints.only("xs")]: {
        justifyContent: "center",
      },
    },
  };

  if (theme.direction === "ltr") {
    return {
      ...baseStyles,
      actions: {
        marginLeft: "auto",
        display: "flex",
        flexWrap: "wrap",
        "& > *": {
          marginLeft: 10,
        },
      },
    };
  } else {
    return {
      ...baseStyles,
      actions: {
        marginRight: "auto",
        display: "flex",
        flexWrap: "wrap",
        "& > *": {
          marginRight: 10,
        },
      },
    };
  }
};

export const getFormStyles = (theme) => {
  return {};
};

export const getSectionHeaderStyles = (theme) => {
  if (theme.direction === "ltr") {
    return {
      default_headerSection_container: {
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        "& > *": {
          marginTop: 10,
          marginBottom: 10,
        },
      },
      default_headerSection_pageTitle: {
        fontWeight: "bold",
        marginRight: 50,
      },
      default_headerSection_actionsContainer: {
        display: "flex",
        flexWrap: "wrap",
        marginLeft: "auto",
        "& > *": {
          marginLeft: 10,
          marginBottom: 10,
        },
      },
    };
  } else {
    return {
      default_headerSection_container: {
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        "& > *": {
          marginTop: 10,
          marginBottom: 10,
        },
      },
      default_headerSection_pageTitle: {
        fontWeight: "bold",
        marginLeft: 50,
      },
      default_headerSection_actionsContainer: {
        display: "flex",
        flexWrap: "wrap",
        marginRight: "auto",
        "& > *": {
          marginRight: 10,
        },
      },
    };
  }
};

export const getTypographyStyles = (theme) => {
  return {
    default_typography_heading: {
      fontSize: 26,
    },
    default_typography_subHeading: {
      fontSize: 22,
    },
    default_typography_paragraph: {
      fontSize: 16,
    },
    default_typography_label: {
      fontSize: 12,
    },
    default_typography_capsule: {
      display: "inline-block",
      padding: "8px 25px",
      borderRadius: 50,
      background: "#DEEBFF",
      color: "#57CAF7",
      fontWeight: "bold",
    },
    default_typography_bold: {
      fontWeight: "bold",
    },
    default_typography_medium: {
      fontWeight: "500",
    },
    default_typography_colorDark: {
      color: "#000",
    },
    default_typography_colorLight: {
      color: "#808191",
    },
    default_typography_colorSuccess: {
      color: "#4FBF67",
    },
    default_typography_colorFailure: {
      color: "#FF4031",
    },
    default_typography_colorPrimary: {
      color: "#685BE7",
    },
    default_typography_capitalize: {
      textTransform: "capitalize",
    },
    default_typography_uppercase: {
      textTransform: "uppercase",
    },
  };
};

export const getPageStyles = (theme) => {
  return {
    default_page_root: {
      display: "flex",
      flexDirection: "column",
      borderRadius: 25,
      background: "#fff",
      width: "100%",
      padding: 20,
      height: "100%",
      flexGrow: 1,
      flexBasis: "max-content",
      overflow: "hidden",
      [theme.breakpoints.down("md")]: {
        overflow: "auto",
        minHeight: "100%",
        padding: 15,
        borderRadius: 15,
      },
    },
    default_page_scrollContainer: {
      height: "100%",
      overflow: "hidden",
      [theme.breakpoints.only("xs")]: {
        overflow: "visible",
      },
    },
    default_page_Bg1: {
      background: `${alpha(`#685BE7`, 0.05)} !important`,
    },
    default_page_Bg2: {
      background: alpha(`#8F92A1`, 0.1),
    },
    default_page_BgWhite: {
      background: "#fff",
    },
    default_page_BgDark: {
      background: "#000",
    },
    default_page_BgTransparent: {
      background: "transparent",
    },
    default_page_removePadding: {
      padding: "0px !important",
    },
    default_page_removeCurves: {
      borderRadius: "0px !important",
    },
    default_page_shadow1: {
      boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
    },
  };
};

export const getModalStyles = (theme) => {
  return {
    default_modal_scrollContainer: {
      height: 300,
      maxHeight: 300,
      overflowY: "auto",
    },
    default_modal_body: {
      padding: "20px 0px",
    },

    default_modal_infoContainer: {
      maxWidth: "fit-content",
      background: "#eee",
      padding: 10,
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      fontSize: 6,
    },
    default_modal_buttonContainers: {},
    default_modal_footer: {
      marginTop: 20,
    },
    default_modal_buttonSecondary: {
      backgroundColor: "rgba(143, 146, 161, 0.1) !important",
      color: "#171717 !important",
      "&:hover": {
        color: "#171717 !important",
        backgroundColor: "rgba(143, 146, 161, 0.1) !important",
      },
    },
  };
};
export const getHistoryStyles = (theme) => {
  return {
    default_history_scrollContainer: {
      padding: 10,
      borderRadius: 16,
      background: alpha(`#8F92A1`, 0.05),
      height: 180,
      maxHeight: 200,
      overflowY: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    default_history_scrollItem: {
      padding: `10px 15px`,
      borderRadius: 16,
      width: "100%",
      background: "#fff",
    },

    default_history_headerContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      [theme.breakpoints.down("sm")]: {
        justifyContent: "flex-start",
        flexDirection: "column",
      },
    },
  };
};

export const stopEventBubble = (cb) => (e) => {
  cb && cb();
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
};

export const searchBy = (list, keywords, text) => {
  const _list = [...list];

  const getProperty = (obj, paths) => {
    if (!paths.length || typeof obj !== "object" || Array.isArray(obj))
      return obj;
    const [key] = paths.splice(0, 1);

    return getProperty(obj[key], paths);
  };

  return _list.filter((el) => {
    return keywords.some((keyword) => {
      const branches = String(keyword)
        .split("=>")
        .map((item) => String(item).trim());

      const value = getProperty(el, branches);

      if (Array.isArray(value))
        return searchBy(value, [branches.join("=>")], text).length;

      return String(value)
        .toLowerCase()
        .includes(String(text).trim().toLowerCase());
    });
  });
};

export const sortByFavorite = (list = [], id) => {
  const sortable = list.some((el) => el.hasOwnProperty("favoriteBy"));

  if (!id || !sortable) return list;

  return list.sort((a, b) => {
    const first = (a.favoriteBy || []).includes(id);
    const second = (b.favoriteBy || []).includes(id);

    if (first && second) {
      return 0;
    }

    if (first) {
      return -1;
    }
    if (second) {
      return 1;
    }
  });
};

export const sortBySpecialFavorite = (list = [], id) => {
  const sortable = list.some((el) => el.hasOwnProperty("_favoriteBy"));

  if (!id || !sortable) return list;

  return list.sort((a, b) => {
    const first = (a._favoriteBy || []).includes(id);
    const second = (b._favoriteBy || []).includes(id);

    if (first && second) {
      return 0;
    }

    if (first) {
      return -1;
    }
    if (second) {
      return 1;
    }
  });
};
