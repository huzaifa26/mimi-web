import { useEffect, useMemo, useRef, useState } from 'react';
import { Keys } from '../utils/keys';

import differenceWith from 'lodash/differenceWith';

export const usePagination = (query, modifier, comparator) => {
    const lastDoc = useRef(null);

    const listeners = useRef([]);

    const [state, setState] = useState({
        data: [],
        loading: false,
        hasMore: false,
    });

    const fetch = useMemo(
        () => async () => {
            try {
                const docRefs = await query.startAfter(lastDoc.current).limit(Keys.PAGE_SIZE).get();

                listeners.current.push(
                    query
                        .startAfter(lastDoc.current)
                        .limit(Keys.PAGE_SIZE)
                        .onSnapshot(async snapshot => {
                            const cache = snapshot
                                .docChanges()
                                .filter(change => change.type == 'modified')
                                .map(el => el.doc.data())
                                .reduce((acc, el) => {
                                    acc[el.id] = el;
                                    return acc;
                                }, {});


                            let additions = snapshot
                                .docChanges()
                                .filter(change => change.type === 'added')
                                .forEach(el => el.doc.data());
                            // console.log(additions);


                            if (modifier) {
                                additions = await modifier(additions);
                            }

                            const removals = snapshot
                                .docChanges()
                                .filter(change => change.type == 'removed')
                                .map(el => el.doc.data().id);

                            if (!Object.keys(cache) && !additions.length && !removals.length) return;

                            setState(prev => {
                                let updatedData = prev.data.map(el => cache[el.id] || el);

                                // console.log(updatedData);

                                if (additions?.length) {
                                    const newEntries = differenceWith(additions, updatedData, (a, b) => a.id === b.id);
                                    // console.log(newEntries);
                                    
                                    // console.log({
                                    //     updatedData,
                                    //     additions,
                                    //     newEntries,
                                    //     cache,
                                    //     removals,
                                    // });
                                    
                                    if (newEntries.length)
                                    updatedData = [...updatedData, ...newEntries];
                                }
                                if (removals.length) updatedData = updatedData.filter(el => !removals.includes(el.id));

                                if (comparator) updatedData = comparator(updatedData);

                                return {
                                    ...prev,
                                    data: updatedData,
                                };
                            });
                        }),
                );

                let docs = docRefs.docs.map(el => el.data());

                const fetchedDocsLength = docs.length;

                if (modifier) {
                    docs = await modifier(docs);
                }

                setState(prev => {
                    let updatedData = [...prev.data, ...docs];
                    if (comparator) updatedData = comparator(updatedData);

                    return { ...prev, data: updatedData, hasMore: fetchedDocsLength % Keys.PAGE_SIZE === 0 };
                });
                lastDoc.current = docRefs.docs[docRefs.docs.length - 1];

                return docs.length;
            } catch (error) {
                console.log(error);
            }
        },
        [query, state.data],
    );

    const init = async () => {
        setState(prev => ({ ...prev, loading: true }));
        await fetch();

        setState(prev => ({ ...prev, loading: false }));
    };

    useEffect(() => {
        init();

        return () => {
            setState({
                data: [],
                loading: false,
                hasMore: false,
            });
            listeners.current.forEach(el => el());
            lastDoc.current = null;
        };
    }, []);

    return {
        ...state,
        loadMore: state.hasMore ? fetch : null,
    };
};
