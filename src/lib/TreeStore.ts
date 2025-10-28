import type { TreeItem } from '../types/global';

/**
 * A high-performance in-memory tree data store that indexes items by ID and parent-child relationships.
 * Optimized for fast lookups, subtree extraction, and path traversal.
 */
class TreeStore {
    private items: TreeItem[];
    private idMap: Map<string | number, TreeItem>;
    private childrenMap: Map<string | number, TreeItem[]>;

    /**
     * Initializes the TreeStore with an array of tree items.
     * Builds internal indexes for O(1) access to items and children.
     * @param items - Array of items with `id`, `parent`, and arbitrary additional fields.
     */
    constructor(items: TreeItem[]) {
        this.items = [...items];
        this.idMap = new Map<string | number, TreeItem>();
        this.childrenMap = new Map<string | number, TreeItem[]>();

        for (const item of items) {
            this.idMap.set(item.id, item);
            if (item.parent !== null) {
                if (!this.childrenMap.has(item.parent)) {
                    this.childrenMap.set(item.parent, []);
                }
                this.childrenMap.get(item.parent)!.push(item);
            }
        }
    }

    /**
     * Returns the original array of items as passed to the constructor.
     * @returns The full list of tree items in their original order.
     */
    getAll(): TreeItem[] {
        return this.items;
    }

    /**
     * Retrieves a single tree item by its ID.
     * @param id - The unique identifier of the item (string or number).
     * @returns The item object if found, otherwise undefined.
     */
    getItem(id: string | number): TreeItem | undefined {
        return this.idMap.get(id);
    }

    /**
     * Returns direct children of the item with the specified ID.
     * @param id - The ID of the parent item.
     * @returns An array of direct child items; empty array if no children exist.
     */
    getChildren(id: string | number): TreeItem[] {
        return this.childrenMap.get(id) ?? [];
    }

    /**
     * Returns all descendants (children, grandchildren, etc.) of the item with the specified ID.
     * Traverses the subtree in depth-first order.
     * @param id - The ID of the root item for subtree traversal.
     * @returns An array of all descendant items.
     */
    getAllChildren(id: string | number): TreeItem[] {
        const result: TreeItem[] = [];
        const stack: (string | number)[] = [id];

        while (stack.length > 0) {
            const currentId = stack.pop()!;
            const children = this.getChildren(currentId);
            for (const child of children) {
                result.push(child);
                stack.push(child.id);
            }
        }

        return result;
    }

    /**
     * Returns the ancestry path from the specified item up to the root.
     * The result starts with the item itself and ends with the top-level ancestor.
     * @param id - The ID of the starting item.
     * @returns An array representing the path from the item to the root (inclusive).
     */
    getAllParents(id: string | number): TreeItem[] {
        const result: TreeItem[] = [];
        let currentId: string | number | null = id;

        while (currentId !== null && this.idMap.has(currentId)) {
            const item: TreeItem = this.idMap.get(currentId)!;
            result.push(item);
            currentId = item.parent;
        }

        return result;
    }

    /**
     * Adds a new item to the tree store.
     * Throws an error if an item with the same ID already exists.
     * @param item - The new tree item to add.
     */
    addItem(item: TreeItem): void {
        if (this.idMap.has(item.id)) {
            throw new Error(`Item with id ${item.id} already exists`);
        }

        this.items.push(item);
        this.idMap.set(item.id, item);

        if(item.parent !== null) {
            if (!this.childrenMap.has(item.parent)) {
                this.childrenMap.set(item.parent, []);
            }
            this.childrenMap.get(item.parent)!.push(item);
        }
    }

    /**
     * Removes an item and its entire subtree from the tree store.
     * @param id - The ID of the item to remove (including all its descendants).
     */
    removeItem(id: string | number): void {
        const toRemove = [id, ...this.getAllChildren(id).map(i => i.id)];
        const toRemoveSet = new Set(toRemove);

        this.items = this.items.filter(item => !toRemoveSet.has(item.id));

        for (const rid of toRemove) {
            this.idMap.delete(rid);
        }

        this.childrenMap.clear();
        for (const item of this.items) {
            if(item.parent !== null) {
                if (!this.childrenMap.has(item.parent)) {
                    this.childrenMap.set(item.parent, []);
                }
                this.childrenMap.get(item.parent)!.push(item);
            }
        }
    }

    /**
     * Updates an existing item in the tree store.
     * If the `parent` field changes, internal indexes are rebuilt to maintain consistency.
     * @param item - The updated tree item (must include a valid `id`).
     */
    updateItem(item: TreeItem): void {
        const oldItem = this.getItem(item.id);
        if (!oldItem) {
            throw new Error(`Item with id ${item.id} does not exist`);
        }

        const parentChanged = oldItem.parent !== item.parent;

        Object.assign(oldItem, item);
        this.idMap.set(item.id, oldItem);

        if (parentChanged) {
            this.childrenMap.clear();
            for (const it of this.items) {
                if(it.parent !== null) {
                    if (!this.childrenMap.has(it.parent)) {
                        this.childrenMap.set(it.parent, []);
                    }
                    this.childrenMap.get(it.parent)!.push(it);
                }
            }
        }
    }
}

export default TreeStore;
