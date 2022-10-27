import { makeStyles, Typography, Box } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const useStyles = makeStyles(theme => {
    return {
        actionContainer: {
            cursor: 'pointer',
            borderRadius: 15,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            margin: 'auto',
            minHeight: 140,
            maxWidth: 170,
            height: '100%',
        },
        imgContainer: {
            width: 50,
            height: 50,
            display: 'flex',
            justifyContent: 'center',
            alignitems: 'center',

            '& img': {
                objectFit: 'contain',
            },
        },
        label: {
            fontSize: 16,
            fontWeight: 'bold',
            textTransform: 'captialize',
        },
    };
});

export const ToolBox = ({ label, image, background, ...otherProps }) => {
    const classes = useStyles();

    return (
        <div
            {...otherProps}
            className={classes.actionContainer}
            style={{
                background,
            }}
        >
            <div className={classes.imgContainer}>{image}</div>
            <Box marginX={2}>
                <Typography align="center" className={classes.label}>
                    <FormattedMessage id={label} />
                </Typography>
            </Box>
        </div>
    );
};
