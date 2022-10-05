import { Grid, makeStyles, CircularProgress } from '@material-ui/core';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import ReactCrop from 'react-image-crop';
import { FormattedMessage } from 'react-intl';
import { Button, ErrorIcon } from '../../../components';
import { useStore, useUi } from '../../../store';
import firebase from 'firebase';
import { db } from '../../../utils/firebase';
import { nanoid } from 'nanoid';
import 'react-image-crop/dist/ReactCrop.css';
import { getModalStyles } from '../../../utils/helpers';

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
        crop: { height: 200, width: 200, overflow: 'auto', objectFit: 'cover' },
        image: { height: 200, width: 200 },
    };
});

export const UplaoadImageBody = props => {
    const { handleClose, group, image } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user } = storeState;

    const imageRef = useRef();

    const [state, setState] = useState({
        src: null,
        croppedImage: '',
        crop: {
            unit: '%',
            width: 30,
            aspect: 1,
        },
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!image) return;
        const reader = new FileReader();
        reader.addEventListener('load', () => setState(prev => ({ ...prev, src: reader.result })));
        reader.readAsDataURL(image);
    }, [image]);

    const getCroppedImg = (image, crop, fileName) => {
        const canvas = document.createElement('canvas');
        const pixelRatio = window.devicePixelRatio;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext('2d');

        canvas.width = crop.width * pixelRatio * scaleX;
        canvas.height = crop.height * pixelRatio * scaleY;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width * scaleX, crop.height * scaleY);

        return new Promise((resolve, reject) => {
            canvas.toBlob(
                blob => {
                    if (!blob) {
                        console.error('Canvas is empty');
                        return;
                    }
                    blob.name = fileName;

                    resolve(window.URL.createObjectURL(blob));
                },
                'image/jpeg',
                1,
            );
        });
    };

    const makeClientCrop = async crop => {
        if (imageRef.current && crop.width && crop.height) {
            const croppedImageUrl = await getCroppedImg(imageRef.current, crop, 'newFile.jpeg');

            setState(prev => ({ ...prev, croppedImage: croppedImageUrl }));
        }
    };

    const createFile = async () => {
        const response = await fetch(state.croppedImage);
        const data = await response.blob();
        const metadata = {
            type: 'image/jpeg',
        };

        const file = new File([data], 'test.jpg', metadata);
        const storage = firebase.storage();
        const storageRef = storage.ref(`images/${user._code}/Groups/group-${group.id}.jpeg`);
        const result = await storageRef.put(file);
        const imageURL = await result.ref.getDownloadURL();
        await db.collection('Institution').doc(user._code).collection('groups').doc(group.id).update({
            image: imageURL,
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        await createFile();
        setLoading(false);
        handleClose();
    };

    return (
        <Fragment>
            <Grid container spacing={2} justifyContent="center">
                <Grid item justifyContent="center">
                    {state.src && (
                        <ReactCrop
                            className={classes.crop}
                            src={state.src}
                            crop={state.crop}
                            ruleOfThirds
                            onImageLoaded={file => {
                                imageRef.current = file;
                            }}
                            onComplete={crop => makeClientCrop(crop)}
                            onChange={crop => setState(prev => ({ ...prev, crop }))}
                            circularCrop
                        />
                    )}
                </Grid>

                <Grid item justifyContent="center">
                    {state.croppedImage && <img alt="Crop" className={classes.image} src={state.croppedImage} />}
                </Grid>
            </Grid>

            <div className={classes.default_modal_footer}>
                <Grid container spacing={2}>
                    <Grid item xs={6} justifyContent="center">
                        <Button fullWidth disable={loading} className={classes.default_modal_buttonSecondary} onClick={handleClose}>
                            <FormattedMessage id="cancel" />
                        </Button>
                    </Grid>
                    <Grid item xs={6} justifyContent="center">
                        <Button loading={loading} fullWidth disable={loading} onClick={handleSubmit}>
                            <FormattedMessage id="upload_image" />
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    );
};
