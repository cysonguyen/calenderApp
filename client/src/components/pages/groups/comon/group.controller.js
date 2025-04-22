'use client';

import { createGroupApi, deleteGroupApi, updateGroupApi } from "@/app/api/client/account";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

export const useGroupController = () => {
    const { create, isLoadingCreate } = useCreateGroup();
    const { update, isLoadingUpdate } = useUpdateGroup();
    const { deleteGroup, isLoadingDelete } = useDeleteGroup()

    const createGroup = useCallback((payload) => {
        return create(payload);
    }, [create]);

    const updateGroup = useCallback((payload) => {
        return update(payload);
    }, [update]);

    const deleteGroupManual = useCallback((payload) => {
        return deleteGroup(payload);
    }, [deleteGroup]);

    return { createGroup, isLoadingCreate, updateGroup, isLoadingUpdate, deleteGroupManual, isLoadingDelete };
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

const useDeleteGroup = () => {
    const { mutate: deleteGroup, isLoading: isLoadingDelete } = useMutation({
        mutationFn: async ({ groupId, onFinish }) => {
            const res = await deleteGroupApi(groupId);
            onFinish?.(res);
            return res;
        },
    });
    return { deleteGroup, isLoadingDelete };
}