export type TreeItem = {
    id: string | number;
    parent: string | number | null;
    label: string;
    [key: string]: any;
};
