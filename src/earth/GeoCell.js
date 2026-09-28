export class GeoCell
{
    constructor(
        id,
        vertices,
        level = 0
    )
    {
        this.id = id;

        this.vertices = vertices;

        this.level = level;

        this.parent = null;

        this.children = [];

        // Geographic center of this cell.
        this.center = null;
    }

    addChild(child)
    {
        child.parent = this;

        this.children.push(
            child
        );
    }

    isLeaf()
    {
        return this.children.length === 0;
    }

    setCenter(center)
    {
        this.center = center;
    }
}