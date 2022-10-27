import { makeStyles, Typography, Box } from '@material-ui/core';
import clsx from 'clsx';
import { FormattedMessage } from 'react-intl';

const useStyles = makeStyles(theme => {
    return {
        actionContainer: {
            cursor: 'pointer',
            borderRadius: 15,
            display: 'flex',
            minHeight: 100,
            alignItems: 'center',
            padding: '20px 30px',
            margin: 'auto',
        },
        imgContainer: {
            width: 40,
            height: 40,
            display: 'flex',
            justifyContent: 'center',
            alignitems: 'center',
        },
        label: {
            fontSize: 16,
            fontWeight: 'bold',
            textTransform: 'captialize',
        },
        fullWidth: {
            justifyContent: 'center',
            width: '100%',
        },
    };
});

export const ToolButton = ({ label, image, background, fullWidth, ...otherProps }) => {
    const classes = useStyles();

    return (
        <div
            {...otherProps}
            className={clsx({
                [classes.actionContainer]: true,
                [classes.fullWidth]: fullWidth,
            })}
            style={{
                background,
            }}
        >
            <div className={classes.imgContainer}>{image}</div>
            <Box marginX={2}>
                <Typography className={classes.label}>
                    <FormattedMessage id={label} />
                </Typography>
            </Box>
        </div>
    );
};
