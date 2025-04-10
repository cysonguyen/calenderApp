'use client';

import { createGroupApi, updateGroupApi } from "@/app/api/client/account";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

export const useGroupController = () => {
    const { create, isLoadingCreate } = useCreateGroup();
    const { update, isLoadingUpdate } = useUpdateGroup();

    const createGroup = useCallback((payload) => {
        return create(payload);
    }, [create]);

    const updateGroup = useCallback((payload) => {
        return update(payload);
    }, [update]);

    return { createGroup, isLoadingCreate, updateGroup, isLoadingUpdate };
};

const useCreateGroup = () => {
    const { mutate: create, isLoading: isLoadingCreate } = useMutation({
        mutationFn: async (payload) => {
            const res = await createGroupApi(payload.group);
            payload.onFinish?.(res);
            return res;
        },
    });
    return { create, isLoadingCreate };
}

export const useUpdateGroup = () => {
    const { mutate: update, isLoading: isLoadingUpdate } = useMutation({
        mutationFn: async (payload) => {
            const { group, onFinish } = payload;
            const res = await updateGroupApi(group.id, group);
            onFinish?.(res);
            return res;
        },
    });
    return { update, isLoadingUpdate };
}