(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.geojsonvt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = clip;

/* clip features between two axis-parallel lines:
 *     |        |
 *  ___|___     |     /
 * /   |   \____|____/
 *     |        |
 */

function clip(features, scale, k1, k2, axis, intersect, minAll, maxAll) {

    k1 /= scale;
    k2 /= scale;

    if (minAll >= k1 && maxAll <= k2) return features; // trivial accept
    else if (minAll > k2 || maxAll < k1) return null; // trivial reject

    var clipped = [];

    for (var i = 0; i < features.length; i++) {

        var feature = features[i],
            geometry = feature.geometry,
            type = feature.type,
            min, max;

        min = feature.min[axis];
        max = feature.max[axis];

        if (min >= k1 && max <= k2) { // trivial accept
            clipped.push(feature);
            continue;
        } else if (min > k2 || max < k1) continue; // trivial reject

        var slices = type === 1 ?
                clipPoints(geometry, k1, k2, axis) :
                clipGeometry(geometry, k1, k2, axis, intersect, type === 3);

        if (slices.length) {
            // if a feature got clipped, it will likely get clipped on the next zoom level as well,
            // so there's no need to recalculate bboxes
            clipped.push({
                geometry: slices,
                type: type,
                tags: features[i].tags || null,
                min: feature.min,
                max: feature.max
            });
        }
    }

    return clipped.length ? clipped : null;
}

function clipPoints(geometry, k1, k2, axis) {
    var slice = [];

    for (var i = 0; i < geometry.length; i++) {
        var a = geometry[i],
            ak = a[axis];

        if (ak >= k1 && ak <= k2) slice.push(a);
    }
    return slice;
}

function clipGeometry(geometry, k1, k2, axis, intersect, closed) {

    var slices = [];

    for (var i = 0; i < geometry.length; i++) {

        var ak = 0,
            bk = 0,
            b = null,
            points = geometry[i],
            area = points.area,
            dist = points.dist,
            len = points.length,
            a, j, last;

        var slice = [];

        for (j = 0; j < len - 1; j++) {
            a = b || points[j];
            b = points[j + 1];
            ak = bk || a[axis];
            bk = b[axis];

            if (ak < k1) {

                if ((bk > k2)) { // ---|-----|-->
                    slice.push(intersect(a, b, k1), intersect(a, b, k2));
                    if (!closed) slice = newSlice(slices, slice, area, dist);

                } else if (bk >= k1) slice.push(intersect(a, b, k1)); // ---|-->  |

            } else if (ak > k2) {

                if ((bk < k1)) { // <--|-----|---
                    slice.push(intersect(a, b, k2), intersect(a, b, k1));
                    if (!closed) slice = newSlice(slices, slice, area, dist);

                } else if (bk <= k2) slice.push(intersect(a, b, k2)); // |  <--|---

            } else {

                slice.push(a);

                if (bk < k1) { // <--|---  |
                    slice.push(intersect(a, b, k1));
                    if (!closed) slice = newSlice(slices, slice, area, dist);

                } else if (bk > k2) { // |  ---|-->
                    slice.push(intersect(a, b, k2));
                    if (!closed) slice = newSlice(slices, slice, area, dist);
                }
                // | --> |
            }
        }

        // add the last point
        a = points[len - 1];
        ak = a[axis];
        if (ak >= k1 && ak <= k2) slice.push(a);

        // close the polygon if its endpoints are not the same after clipping

        last = slice[slice.length - 1];
        if (closed && last && (slice[0][0] !== last[0] || slice[0][1] !== last[1])) slice.push(slice[0]);

        // add the final slice
        newSlice(slices, slice, area, dist);
    }

    return slices;
}

function newSlice(slices, slice, area, dist) {
    if (slice.length) {
        // we don't recalculate the area/length of the unclipped geometry because the case where it goes
        // below the visibility threshold as a result of clipping is rare, so we avoid doing unnecessary work
        slice.area = area;
        slice.dist = dist;

        slices.push(slice);
    }
    return [];
}

},{}],2:[function(require,module,exports){
'use strict';

module.exports = convert;

var simplify = require('./simplify');

// converts GeoJSON feature into an intermediate projected JSON vector format with simplification data

function convert(data, tolerance) {
    var features = [];

    if (data.type === 'FeatureCollection') {
        for (var i = 0; i < data.features.length; i++) {
            convertFeature(features, data.features[i], tolerance);
        }
    } else if (data.type === 'Feature') {
        convertFeature(features, data, tolerance);

    } else {
        // single geometry or a geometry collection
        convertFeature(features, {geometry: data}, tolerance);
    }
    return features;
}

function convertFeature(features, feature, tolerance) {
    if (feature.geometry === null) {
        // ignore features with null geometry
        return;
    }

    var geom = feature.geometry,
        type = geom.type,
        coords = geom.coordinates,
        tags = feature.properties,
        i, j, rings;

    if (type === 'Point') {
        features.push(create(tags, 1, [projectPoint(coords)]));

    } else if (type === 'MultiPoint') {
        features.push(create(tags, 1, project(coords)));

    } else if (type === 'LineString') {
        features.push(create(tags, 2, [project(coords, tolerance)]));

    } else if (type === 'MultiLineString' || type === 'Polygon') {
        rings = [];
        for (i = 0; i < coords.length; i++) {
            rings.push(project(coords[i], tolerance));
        }
        features.push(create(tags, type === 'Polygon' ? 3 : 2, rings));

    } else if (type === 'MultiPolygon') {
        rings = [];
        for (i = 0; i < coords.length; i++) {
            for (j = 0; j < coords[i].length; j++) {
                rings.push(project(coords[i][j], tolerance));
            }
        }
        features.push(create(tags, 3, rings));

    } else if (type === 'GeometryCollection') {
        for (i = 0; i < geom.geometries.length; i++) {
            convertFeature(features, {
                geometry: geom.geometries[i],
                properties: tags
            }, tolerance);
        }

    } else {
        throw new Error('Input data is not a valid GeoJSON object.');
    }
}

function create(tags, type, geometry) {
    var feature = {
        geometry: geometry,
        type: type,
        tags: tags || null,
        min: [2, 1], // initial bbox values;
        max: [-1, 0]  // note that coords are usually in [0..1] range
    };
    calcBBox(feature);
    return feature;
}

function project(lonlats, tolerance) {
    var projected = [];
    for (var i = 0; i < lonlats.length; i++) {
        projected.push(projectPoint(lonlats[i]));
    }
    if (tolerance) {
        simplify(projected, tolerance);
        calcSize(projected);
    }
    return projected;
}

function projectPoint(p) {
    var sin = Math.sin(p[1] * Math.PI / 180),
        x = (p[0] / 360 + 0.5),
        y = (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI);

    y = y < 0 ? 0 :
        y > 1 ? 1 : y;

    return [x, y, 0];
}

// calculate area and length of the poly
function calcSize(points) {
    var area = 0,
        dist = 0;

    for (var i = 0, a, b; i < points.length - 1; i++) {
        a = b || points[i];
        b = points[i + 1];

        area += a[0] * b[1] - b[0] * a[1];

        // use Manhattan distance instead of Euclidian one to avoid expensive square root computation
        dist += Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
    }
    points.area = Math.abs(area / 2);
    points.dist = dist;
}

// calculate the feature bounding box for faster clipping later
function calcBBox(feature) {
    var geometry = feature.geometry,
        min = feature.min,
        max = feature.max;

    if (feature.type === 1) calcRingBBox(min, max, geometry);
    else for (var i = 0; i < geometry.length; i++) calcRingBBox(min, max, geometry[i]);

    return feature;
}

function calcRingBBox(min, max, points) {
    for (var i = 0, p; i < points.length; i++) {
        p = points[i];
        min[0] = Math.min(p[0], min[0]);
        max[0] = Math.max(p[0], max[0]);
        min[1] = Math.min(p[1], min[1]);
        max[1] = Math.max(p[1], max[1]);
    }
}

},{"./simplify":4}],3:[function(require,module,exports){
'use strict';

module.exports = geojsonvt;

var convert = require('./convert'),     // GeoJSON conversion and preprocessing
    transform = require('./transform'), // coordinate transformation
    clip = require('./clip'),           // stripe clipping algorithm
    wrap = require('./wrap'),           // date line processing
    createTile = require('./tile');     // final simplified tile generation


function geojsonvt(data, options) {
    return new GeoJSONVT(data, options);
}

function GeoJSONVT(data, options) {
    options = this.options = extend(Object.create(this.options), options);

    var debug = options.debug;

    if (debug) console.time('preprocess data');

    var z2 = 1 << options.maxZoom, // 2^z
        features = convert(data, options.tolerance / (z2 * options.extent));

    this.tiles = {};
    this.tileCoords = [];

    if (debug) {
        console.timeEnd('preprocess data');
        console.log('index: maxZoom: %d, maxPoints: %d', options.indexMaxZoom, options.indexMaxPoints);
        console.time('generate tiles');
        this.stats = {};
        this.total = 0;
    }

    features = wrap(features, options.buffer / options.extent, intersectX);

    // start slicing from the top tile down
    if (features.length) this.splitTile(features, 0, 0, 0);

    if (debug) {
        if (features.length) console.log('features: %d, points: %d', this.tiles[0].numFeatures, this.tiles[0].numPoints);
        console.timeEnd('generate tiles');
        console.log('tiles generated:', this.total, JSON.stringify(this.stats));
    }
}

GeoJSONVT.prototype.options = {
    maxZoom: 14,            // max zoom to preserve detail on
    indexMaxZoom: 5,        // max zoom in the tile index
    indexMaxPoints: 100000, // max number of points per tile in the tile index
    solidChildren: false,   // whether to tile solid square tiles further
    tolerance: 3,           // simplification tolerance (higher means simpler)
    extent: 4096,           // tile extent
    buffer: 64,             // tile buffer on each side
    debug: 0                // logging level (0, 1 or 2)
};

GeoJSONVT.prototype.splitTile = function (features, z, x, y, cz, cx, cy) {

    var stack = [features, z, x, y],
        options = this.options,
        debug = options.debug,
        solid = null;

    // avoid recursion by using a processing queue
    while (stack.length) {
        y = stack.pop();
        x = stack.pop();
        z = stack.pop();
        features = stack.pop();

        var z2 = 1 << z,
            id = toID(z, x, y),
            tile = this.tiles[id],
            tileTolerance = z === options.maxZoom ? 0 : options.tolerance / (z2 * options.extent);

        if (!tile) {
            if (debug > 1) console.time('creation');

            tile = this.tiles[id] = createTile(features, z2, x, y, tileTolerance, z === options.maxZoom);
            this.tileCoords.push({z: z, x: x, y: y});

            if (debug) {
                if (debug > 1) {
                    console.log('tile z%d-%d-%d (features: %d, points: %d, simplified: %d)',
                        z, x, y, tile.numFeatures, tile.numPoints, tile.numSimplified);
                    console.timeEnd('creation');
                }
                var key = 'z' + z;
                this.stats[key] = (this.stats[key] || 0) + 1;
                this.total++;
            }
        }

        // save reference to original geometry in tile so that we can drill down later if we stop now
        tile.source = features;

        // if it's the first-pass tiling
        if (!cz) {
            // stop tiling if we reached max zoom, or if the tile is too simple
            if (z === options.indexMaxZoom || tile.numPoints <= options.indexMaxPoints) continue;

        // if a drilldown to a specific tile
        } else {
            // stop tiling if we reached base zoom or our target tile zoom
            if (z === options.maxZoom || z === cz) continue;

            // stop tiling if it's not an ancestor of the target tile
            var m = 1 << (cz - z);
            if (x !== Math.floor(cx / m) || y !== Math.floor(cy / m)) continue;
        }

        // stop tiling if the tile is solid clipped square
        if (!options.solidChildren && isClippedSquare(tile, options.extent, options.buffer)) {
            if (cz) solid = z; // and remember the zoom if we're drilling down
            continue;
        }

        // if we slice further down, no need to keep source geometry
        tile.source = null;

        if (debug > 1) console.time('clipping');

        // values we'll use for clipping
        var k1 = 0.5 * options.buffer / options.extent,
            k2 = 0.5 - k1,
            k3 = 0.5 + k1,
            k4 = 1 + k1,
            tl, bl, tr, br, left, right;

        tl = bl = tr = br = null;

        left  = clip(features, z2, x - k1, x + k3, 0, intersectX, tile.min[0], tile.max[0]);
        right = clip(features, z2, x + k2, x + k4, 0, intersectX, tile.min[0], tile.max[0]);

        if (left) {
            tl = clip(left, z2, y - k1, y + k3, 1, intersectY, tile.min[1], tile.max[1]);
            bl = clip(left, z2, y + k2, y + k4, 1, intersectY, tile.min[1], tile.max[1]);
        }

        if (right) {
            tr = clip(right, z2, y - k1, y + k3, 1, intersectY, tile.min[1], tile.max[1]);
            br = clip(right, z2, y + k2, y + k4, 1, intersectY, tile.min[1], tile.max[1]);
        }

        if (debug > 1) console.timeEnd('clipping');

        if (tl) stack.push(tl, z + 1, x * 2,     y * 2);
        if (bl) stack.push(bl, z + 1, x * 2,     y * 2 + 1);
        if (tr) stack.push(tr, z + 1, x * 2 + 1, y * 2);
        if (br) stack.push(br, z + 1, x * 2 + 1, y * 2 + 1);
    }

    return solid;
};

GeoJSONVT.prototype.getTile = function (z, x, y) {
    var options = this.options,
        extent = options.extent,
        debug = options.debug;

    var z2 = 1 << z;
    x = ((x % z2) + z2) % z2; // wrap tile x coordinate

    var id = toID(z, x, y);
    if (this.tiles[id]) return transform.tile(this.tiles[id], extent);

    if (debug > 1) console.log('drilling down to z%d-%d-%d', z, x, y);

    var z0 = z,
        x0 = x,
        y0 = y,
        parent;

    while (!parent && z0 > 0) {
        z0--;
        x0 = Math.floor(x0 / 2);
        y0 = Math.floor(y0 / 2);
        parent = this.tiles[toID(z0, x0, y0)];
    }

    if (!parent || !parent.source) return null;

    // if we found a parent tile containing the original geometry, we can drill down from it
    if (debug > 1) console.log('found parent tile z%d-%d-%d', z0, x0, y0);

    // it parent tile is a solid clipped square, return it instead since it's identical
    if (isClippedSquare(parent, extent, options.buffer)) return transform.tile(parent, extent);

    if (debug > 1) console.time('drilling down');
    var solid = this.splitTile(parent.source, z0, x0, y0, z, x, y);
    if (debug > 1) console.timeEnd('drilling down');

    // one of the parent tiles was a solid clipped square
    if (solid !== null) {
        var m = 1 << (z - solid);
        id = toID(solid, Math.floor(x / m), Math.floor(y / m));
    }

    return this.tiles[id] ? transform.tile(this.tiles[id], extent) : null;
};

function toID(z, x, y) {
    return (((1 << z) * y + x) * 32) + z;
}

function intersectX(a, b, x) {
    return [x, (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]) + a[1], 1];
}
function intersectY(a, b, y) {
    return [(y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]) + a[0], y, 1];
}

function extend(dest, src) {
    for (var i in src) dest[i] = src[i];
    return dest;
}

// checks whether a tile is a whole-area fill after clipping; if it is, there's no sense slicing it further
function isClippedSquare(tile, extent, buffer) {

    var features = tile.source;
    if (features.length !== 1) return false;

    var feature = features[0];
    if (feature.type !== 3 || feature.geometry.length > 1) return false;

    var len = feature.geometry[0].length;
    if (len !== 5) return false;

    for (var i = 0; i < len; i++) {
        var p = transform.point(feature.geometry[0][i], extent, tile.z2, tile.x, tile.y);
        if ((p[0] !== -buffer && p[0] !== extent + buffer) ||
            (p[1] !== -buffer && p[1] !== extent + buffer)) return false;
    }

    return true;
}

},{"./clip":1,"./convert":2,"./tile":5,"./transform":6,"./wrap":7}],4:[function(require,module,exports){
'use strict';

module.exports = simplify;

// calculate simplification data using optimized Douglas-Peucker algorithm

function simplify(points, tolerance) {

    var sqTolerance = tolerance * tolerance,
        len = points.length,
        first = 0,
        last = len - 1,
        stack = [],
        i, maxSqDist, sqDist, index;

    // always retain the endpoints (1 is the max value)
    points[first][2] = 1;
    points[last][2] = 1;

    // avoid recursion by using a stack
    while (last) {

        maxSqDist = 0;

        for (i = first + 1; i < last; i++) {
            sqDist = getSqSegDist(points[i], points[first], points[last]);

            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            points[index][2] = maxSqDist; // save the point importance in squared pixels as a z coordinate
            stack.push(first);
            stack.push(index);
            first = index;

        } else {
            last = stack.pop();
            first = stack.pop();
        }
    }
}

// square distance from a point to a segment
function getSqSegDist(p, a, b) {

    var x = a[0], y = a[1],
        bx = b[0], by = b[1],
        px = p[0], py = p[1],
        dx = bx - x,
        dy = by - y;

    if (dx !== 0 || dy !== 0) {

        var t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = bx;
            y = by;

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = px - x;
    dy = py - y;

    return dx * dx + dy * dy;
}

},{}],5:[function(require,module,exports){
'use strict';

module.exports = createTile;

function createTile(features, z2, tx, ty, tolerance, noSimplify) {
    var tile = {
        features: [],
        numPoints: 0,
        numSimplified: 0,
        numFeatures: 0,
        source: null,
        x: tx,
        y: ty,
        z2: z2,
        transformed: false,
        min: [2, 1],
        max: [-1, 0]
    };
    for (var i = 0; i < features.length; i++) {
        tile.numFeatures++;
        addFeature(tile, features[i], tolerance, noSimplify);

        var min = features[i].min,
            max = features[i].max;

        if (min[0] < tile.min[0]) tile.min[0] = min[0];
        if (min[1] < tile.min[1]) tile.min[1] = min[1];
        if (max[0] > tile.max[0]) tile.max[0] = max[0];
        if (max[1] > tile.max[1]) tile.max[1] = max[1];
    }
    return tile;
}

function addFeature(tile, feature, tolerance, noSimplify) {

    var geom = feature.geometry,
        type = feature.type,
        simplified = [],
        sqTolerance = tolerance * tolerance,
        i, j, ring, p;

    if (type === 1) {
        for (i = 0; i < geom.length; i++) {
            simplified.push(geom[i]);
            tile.numPoints++;
            tile.numSimplified++;
        }

    } else {

        // simplify and transform projected coordinates for tile geometry
        for (i = 0; i < geom.length; i++) {
            ring = geom[i];

            // filter out tiny polylines & polygons
            if (!noSimplify && ((type === 2 && ring.dist < tolerance) ||
                                (type === 3 && ring.area < sqTolerance))) {
                tile.numPoints += ring.length;
                continue;
            }

            var simplifiedRing = [];

            for (j = 0; j < ring.length; j++) {
                p = ring[j];
                // keep points with importance > tolerance
                if (noSimplify || p[2] > sqTolerance) {
                    simplifiedRing.push(p);
                    tile.numSimplified++;
                }
                tile.numPoints++;
            }

            simplified.push(simplifiedRing);
        }
    }

    if (simplified.length) {
        tile.features.push({
            geometry: simplified,
            type: type,
            tags: feature.tags || null
        });
    }
}

},{}],6:[function(require,module,exports){
'use strict';

exports.tile = transformTile;
exports.point = transformPoint;

// Transforms the coordinates of each feature in the given tile from
// mercator-projected space into (extent x extent) tile space.
function transformTile(tile, extent) {
    if (tile.transformed) return tile;

    var z2 = tile.z2,
        tx = tile.x,
        ty = tile.y,
        i, j, k;

    for (i = 0; i < tile.features.length; i++) {
        var feature = tile.features[i],
            geom = feature.geometry,
            type = feature.type;

        if (type === 1) {
            for (j = 0; j < geom.length; j++) geom[j] = transformPoint(geom[j], extent, z2, tx, ty);

        } else {
            for (j = 0; j < geom.length; j++) {
                var ring = geom[j];
                for (k = 0; k < ring.length; k++) ring[k] = transformPoint(ring[k], extent, z2, tx, ty);
            }
        }
    }

    tile.transformed = true;

    return tile;
}

function transformPoint(p, extent, z2, tx, ty) {
    var x = Math.round(extent * (p[0] * z2 - tx)),
        y = Math.round(extent * (p[1] * z2 - ty));
    return [x, y];
}

},{}],7:[function(require,module,exports){
'use strict';

var clip = require('./clip');

module.exports = wrap;

function wrap(features, buffer, intersectX) {
    var merged = features,
        left  = clip(features, 1, -1 - buffer, buffer,     0, intersectX, -1, 2), // left world copy
        right = clip(features, 1,  1 - buffer, 2 + buffer, 0, intersectX, -1, 2); // right world copy

    if (left || right) {
        merged = clip(features, 1, -buffer, 1 + buffer, 0, intersectX, -1, 2); // center world copy

        if (left) merged = shiftFeatureCoords(left, 1).concat(merged); // merge left into center
        if (right) merged = merged.concat(shiftFeatureCoords(right, -1)); // merge right into center
    }

    return merged;
}

function shiftFeatureCoords(features, offset) {
    var newFeatures = [];

    for (var i = 0; i < features.length; i++) {
        var feature = features[i],
            type = feature.type;

        var newGeometry;

        if (type === 1) {
            newGeometry = shiftCoords(feature.geometry, offset);
        } else {
            newGeometry = [];
            for (var j = 0; j < feature.geometry.length; j++) {
                newGeometry.push(shiftCoords(feature.geometry[j], offset));
            }
        }

        newFeatures.push({
            geometry: newGeometry,
            type: type,
            tags: feature.tags,
            min: [feature.min[0] + offset, feature.min[1]],
            max: [feature.max[0] + offset, feature.max[1]]
        });
    }

    return newFeatures;
}

function shiftCoords(points, offset) {
    var newPoints = [];
    newPoints.area = points.area;
    newPoints.dist = points.dist;

    for (var i = 0; i < points.length; i++) {
        newPoints.push([points[i][0] + offset, points[i][1], points[i][2]]);
    }
    return newPoints;
}

},{"./clip":1}]},{},[3])(3)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpcC5qcyIsInNyYy9jb252ZXJ0LmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3NpbXBsaWZ5LmpzIiwic3JjL3RpbGUuanMiLCJzcmMvdHJhbnNmb3JtLmpzIiwic3JjL3dyYXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsaXA7XHJcblxyXG4vKiBjbGlwIGZlYXR1cmVzIGJldHdlZW4gdHdvIGF4aXMtcGFyYWxsZWwgbGluZXM6XHJcbiAqICAgICB8ICAgICAgICB8XHJcbiAqICBfX198X19fICAgICB8ICAgICAvXHJcbiAqIC8gICB8ICAgXFxfX19ffF9fX18vXHJcbiAqICAgICB8ICAgICAgICB8XHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gY2xpcChmZWF0dXJlcywgc2NhbGUsIGsxLCBrMiwgYXhpcywgaW50ZXJzZWN0LCBtaW5BbGwsIG1heEFsbCkge1xyXG5cclxuICAgIGsxIC89IHNjYWxlO1xyXG4gICAgazIgLz0gc2NhbGU7XHJcblxyXG4gICAgaWYgKG1pbkFsbCA+PSBrMSAmJiBtYXhBbGwgPD0gazIpIHJldHVybiBmZWF0dXJlczsgLy8gdHJpdmlhbCBhY2NlcHRcclxuICAgIGVsc2UgaWYgKG1pbkFsbCA+IGsyIHx8IG1heEFsbCA8IGsxKSByZXR1cm4gbnVsbDsgLy8gdHJpdmlhbCByZWplY3RcclxuXHJcbiAgICB2YXIgY2xpcHBlZCA9IFtdO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmVhdHVyZXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgdmFyIGZlYXR1cmUgPSBmZWF0dXJlc1tpXSxcclxuICAgICAgICAgICAgZ2VvbWV0cnkgPSBmZWF0dXJlLmdlb21ldHJ5LFxyXG4gICAgICAgICAgICB0eXBlID0gZmVhdHVyZS50eXBlLFxyXG4gICAgICAgICAgICBtaW4sIG1heDtcclxuXHJcbiAgICAgICAgbWluID0gZmVhdHVyZS5taW5bYXhpc107XHJcbiAgICAgICAgbWF4ID0gZmVhdHVyZS5tYXhbYXhpc107XHJcblxyXG4gICAgICAgIGlmIChtaW4gPj0gazEgJiYgbWF4IDw9IGsyKSB7IC8vIHRyaXZpYWwgYWNjZXB0XHJcbiAgICAgICAgICAgIGNsaXBwZWQucHVzaChmZWF0dXJlKTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChtaW4gPiBrMiB8fCBtYXggPCBrMSkgY29udGludWU7IC8vIHRyaXZpYWwgcmVqZWN0XHJcblxyXG4gICAgICAgIHZhciBzbGljZXMgPSB0eXBlID09PSAxID9cclxuICAgICAgICAgICAgICAgIGNsaXBQb2ludHMoZ2VvbWV0cnksIGsxLCBrMiwgYXhpcykgOlxyXG4gICAgICAgICAgICAgICAgY2xpcEdlb21ldHJ5KGdlb21ldHJ5LCBrMSwgazIsIGF4aXMsIGludGVyc2VjdCwgdHlwZSA9PT0gMyk7XHJcblxyXG4gICAgICAgIGlmIChzbGljZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIC8vIGlmIGEgZmVhdHVyZSBnb3QgY2xpcHBlZCwgaXQgd2lsbCBsaWtlbHkgZ2V0IGNsaXBwZWQgb24gdGhlIG5leHQgem9vbSBsZXZlbCBhcyB3ZWxsLFxyXG4gICAgICAgICAgICAvLyBzbyB0aGVyZSdzIG5vIG5lZWQgdG8gcmVjYWxjdWxhdGUgYmJveGVzXHJcbiAgICAgICAgICAgIGNsaXBwZWQucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBnZW9tZXRyeTogc2xpY2VzLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICAgICAgICAgIHRhZ3M6IGZlYXR1cmVzW2ldLnRhZ3MgfHwgbnVsbCxcclxuICAgICAgICAgICAgICAgIG1pbjogZmVhdHVyZS5taW4sXHJcbiAgICAgICAgICAgICAgICBtYXg6IGZlYXR1cmUubWF4XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY2xpcHBlZC5sZW5ndGggPyBjbGlwcGVkIDogbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xpcFBvaW50cyhnZW9tZXRyeSwgazEsIGsyLCBheGlzKSB7XHJcbiAgICB2YXIgc2xpY2UgPSBbXTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdlb21ldHJ5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGEgPSBnZW9tZXRyeVtpXSxcclxuICAgICAgICAgICAgYWsgPSBhW2F4aXNdO1xyXG5cclxuICAgICAgICBpZiAoYWsgPj0gazEgJiYgYWsgPD0gazIpIHNsaWNlLnB1c2goYSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc2xpY2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsaXBHZW9tZXRyeShnZW9tZXRyeSwgazEsIGsyLCBheGlzLCBpbnRlcnNlY3QsIGNsb3NlZCkge1xyXG5cclxuICAgIHZhciBzbGljZXMgPSBbXTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdlb21ldHJ5Lmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgIHZhciBhayA9IDAsXHJcbiAgICAgICAgICAgIGJrID0gMCxcclxuICAgICAgICAgICAgYiA9IG51bGwsXHJcbiAgICAgICAgICAgIHBvaW50cyA9IGdlb21ldHJ5W2ldLFxyXG4gICAgICAgICAgICBhcmVhID0gcG9pbnRzLmFyZWEsXHJcbiAgICAgICAgICAgIGRpc3QgPSBwb2ludHMuZGlzdCxcclxuICAgICAgICAgICAgbGVuID0gcG9pbnRzLmxlbmd0aCxcclxuICAgICAgICAgICAgYSwgaiwgbGFzdDtcclxuXHJcbiAgICAgICAgdmFyIHNsaWNlID0gW107XHJcblxyXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBsZW4gLSAxOyBqKyspIHtcclxuICAgICAgICAgICAgYSA9IGIgfHwgcG9pbnRzW2pdO1xyXG4gICAgICAgICAgICBiID0gcG9pbnRzW2ogKyAxXTtcclxuICAgICAgICAgICAgYWsgPSBiayB8fCBhW2F4aXNdO1xyXG4gICAgICAgICAgICBiayA9IGJbYXhpc107XHJcblxyXG4gICAgICAgICAgICBpZiAoYWsgPCBrMSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICgoYmsgPiBrMikpIHsgLy8gLS0tfC0tLS0tfC0tPlxyXG4gICAgICAgICAgICAgICAgICAgIHNsaWNlLnB1c2goaW50ZXJzZWN0KGEsIGIsIGsxKSwgaW50ZXJzZWN0KGEsIGIsIGsyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbG9zZWQpIHNsaWNlID0gbmV3U2xpY2Uoc2xpY2VzLCBzbGljZSwgYXJlYSwgZGlzdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiayA+PSBrMSkgc2xpY2UucHVzaChpbnRlcnNlY3QoYSwgYiwgazEpKTsgLy8gLS0tfC0tPiAgfFxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhayA+IGsyKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKChiayA8IGsxKSkgeyAvLyA8LS18LS0tLS18LS0tXHJcbiAgICAgICAgICAgICAgICAgICAgc2xpY2UucHVzaChpbnRlcnNlY3QoYSwgYiwgazIpLCBpbnRlcnNlY3QoYSwgYiwgazEpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNsb3NlZCkgc2xpY2UgPSBuZXdTbGljZShzbGljZXMsIHNsaWNlLCBhcmVhLCBkaXN0KTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJrIDw9IGsyKSBzbGljZS5wdXNoKGludGVyc2VjdChhLCBiLCBrMikpOyAvLyB8ICA8LS18LS0tXHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIHNsaWNlLnB1c2goYSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGJrIDwgazEpIHsgLy8gPC0tfC0tLSAgfFxyXG4gICAgICAgICAgICAgICAgICAgIHNsaWNlLnB1c2goaW50ZXJzZWN0KGEsIGIsIGsxKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbG9zZWQpIHNsaWNlID0gbmV3U2xpY2Uoc2xpY2VzLCBzbGljZSwgYXJlYSwgZGlzdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiayA+IGsyKSB7IC8vIHwgIC0tLXwtLT5cclxuICAgICAgICAgICAgICAgICAgICBzbGljZS5wdXNoKGludGVyc2VjdChhLCBiLCBrMikpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghY2xvc2VkKSBzbGljZSA9IG5ld1NsaWNlKHNsaWNlcywgc2xpY2UsIGFyZWEsIGRpc3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gfCAtLT4gfFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBhZGQgdGhlIGxhc3QgcG9pbnRcclxuICAgICAgICBhID0gcG9pbnRzW2xlbiAtIDFdO1xyXG4gICAgICAgIGFrID0gYVtheGlzXTtcclxuICAgICAgICBpZiAoYWsgPj0gazEgJiYgYWsgPD0gazIpIHNsaWNlLnB1c2goYSk7XHJcblxyXG4gICAgICAgIC8vIGNsb3NlIHRoZSBwb2x5Z29uIGlmIGl0cyBlbmRwb2ludHMgYXJlIG5vdCB0aGUgc2FtZSBhZnRlciBjbGlwcGluZ1xyXG5cclxuICAgICAgICBsYXN0ID0gc2xpY2Vbc2xpY2UubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgaWYgKGNsb3NlZCAmJiBsYXN0ICYmIChzbGljZVswXVswXSAhPT0gbGFzdFswXSB8fCBzbGljZVswXVsxXSAhPT0gbGFzdFsxXSkpIHNsaWNlLnB1c2goc2xpY2VbMF0pO1xyXG5cclxuICAgICAgICAvLyBhZGQgdGhlIGZpbmFsIHNsaWNlXHJcbiAgICAgICAgbmV3U2xpY2Uoc2xpY2VzLCBzbGljZSwgYXJlYSwgZGlzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNsaWNlcztcclxufVxyXG5cclxuZnVuY3Rpb24gbmV3U2xpY2Uoc2xpY2VzLCBzbGljZSwgYXJlYSwgZGlzdCkge1xyXG4gICAgaWYgKHNsaWNlLmxlbmd0aCkge1xyXG4gICAgICAgIC8vIHdlIGRvbid0IHJlY2FsY3VsYXRlIHRoZSBhcmVhL2xlbmd0aCBvZiB0aGUgdW5jbGlwcGVkIGdlb21ldHJ5IGJlY2F1c2UgdGhlIGNhc2Ugd2hlcmUgaXQgZ29lc1xyXG4gICAgICAgIC8vIGJlbG93IHRoZSB2aXNpYmlsaXR5IHRocmVzaG9sZCBhcyBhIHJlc3VsdCBvZiBjbGlwcGluZyBpcyByYXJlLCBzbyB3ZSBhdm9pZCBkb2luZyB1bm5lY2Vzc2FyeSB3b3JrXHJcbiAgICAgICAgc2xpY2UuYXJlYSA9IGFyZWE7XHJcbiAgICAgICAgc2xpY2UuZGlzdCA9IGRpc3Q7XHJcblxyXG4gICAgICAgIHNsaWNlcy5wdXNoKHNsaWNlKTtcclxuICAgIH1cclxuICAgIHJldHVybiBbXTtcclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnZlcnQ7XHJcblxyXG52YXIgc2ltcGxpZnkgPSByZXF1aXJlKCcuL3NpbXBsaWZ5Jyk7XHJcblxyXG4vLyBjb252ZXJ0cyBHZW9KU09OIGZlYXR1cmUgaW50byBhbiBpbnRlcm1lZGlhdGUgcHJvamVjdGVkIEpTT04gdmVjdG9yIGZvcm1hdCB3aXRoIHNpbXBsaWZpY2F0aW9uIGRhdGFcclxuXHJcbmZ1bmN0aW9uIGNvbnZlcnQoZGF0YSwgdG9sZXJhbmNlKSB7XHJcbiAgICB2YXIgZmVhdHVyZXMgPSBbXTtcclxuXHJcbiAgICBpZiAoZGF0YS50eXBlID09PSAnRmVhdHVyZUNvbGxlY3Rpb24nKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnZlcnRGZWF0dXJlKGZlYXR1cmVzLCBkYXRhLmZlYXR1cmVzW2ldLCB0b2xlcmFuY2UpO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoZGF0YS50eXBlID09PSAnRmVhdHVyZScpIHtcclxuICAgICAgICBjb252ZXJ0RmVhdHVyZShmZWF0dXJlcywgZGF0YSwgdG9sZXJhbmNlKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIHNpbmdsZSBnZW9tZXRyeSBvciBhIGdlb21ldHJ5IGNvbGxlY3Rpb25cclxuICAgICAgICBjb252ZXJ0RmVhdHVyZShmZWF0dXJlcywge2dlb21ldHJ5OiBkYXRhfSwgdG9sZXJhbmNlKTtcclxuICAgIH1cclxuICAgIHJldHVybiBmZWF0dXJlcztcclxufVxyXG5cclxuZnVuY3Rpb24gY29udmVydEZlYXR1cmUoZmVhdHVyZXMsIGZlYXR1cmUsIHRvbGVyYW5jZSkge1xyXG4gICAgaWYgKGZlYXR1cmUuZ2VvbWV0cnkgPT09IG51bGwpIHtcclxuICAgICAgICAvLyBpZ25vcmUgZmVhdHVyZXMgd2l0aCBudWxsIGdlb21ldHJ5XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBnZW9tID0gZmVhdHVyZS5nZW9tZXRyeSxcclxuICAgICAgICB0eXBlID0gZ2VvbS50eXBlLFxyXG4gICAgICAgIGNvb3JkcyA9IGdlb20uY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgdGFncyA9IGZlYXR1cmUucHJvcGVydGllcyxcclxuICAgICAgICBpLCBqLCByaW5ncztcclxuXHJcbiAgICBpZiAodHlwZSA9PT0gJ1BvaW50Jykge1xyXG4gICAgICAgIGZlYXR1cmVzLnB1c2goY3JlYXRlKHRhZ3MsIDEsIFtwcm9qZWN0UG9pbnQoY29vcmRzKV0pKTtcclxuXHJcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdNdWx0aVBvaW50Jykge1xyXG4gICAgICAgIGZlYXR1cmVzLnB1c2goY3JlYXRlKHRhZ3MsIDEsIHByb2plY3QoY29vcmRzKSkpO1xyXG5cclxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0xpbmVTdHJpbmcnKSB7XHJcbiAgICAgICAgZmVhdHVyZXMucHVzaChjcmVhdGUodGFncywgMiwgW3Byb2plY3QoY29vcmRzLCB0b2xlcmFuY2UpXSkpO1xyXG5cclxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ011bHRpTGluZVN0cmluZycgfHwgdHlwZSA9PT0gJ1BvbHlnb24nKSB7XHJcbiAgICAgICAgcmluZ3MgPSBbXTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJpbmdzLnB1c2gocHJvamVjdChjb29yZHNbaV0sIHRvbGVyYW5jZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmZWF0dXJlcy5wdXNoKGNyZWF0ZSh0YWdzLCB0eXBlID09PSAnUG9seWdvbicgPyAzIDogMiwgcmluZ3MpKTtcclxuXHJcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdNdWx0aVBvbHlnb24nKSB7XHJcbiAgICAgICAgcmluZ3MgPSBbXTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBjb29yZHNbaV0ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJpbmdzLnB1c2gocHJvamVjdChjb29yZHNbaV1bal0sIHRvbGVyYW5jZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZlYXR1cmVzLnB1c2goY3JlYXRlKHRhZ3MsIDMsIHJpbmdzKSk7XHJcblxyXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnR2VvbWV0cnlDb2xsZWN0aW9uJykge1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBnZW9tLmdlb21ldHJpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29udmVydEZlYXR1cmUoZmVhdHVyZXMsIHtcclxuICAgICAgICAgICAgICAgIGdlb21ldHJ5OiBnZW9tLmdlb21ldHJpZXNbaV0sXHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB0YWdzXHJcbiAgICAgICAgICAgIH0sIHRvbGVyYW5jZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnB1dCBkYXRhIGlzIG5vdCBhIHZhbGlkIEdlb0pTT04gb2JqZWN0LicpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGUodGFncywgdHlwZSwgZ2VvbWV0cnkpIHtcclxuICAgIHZhciBmZWF0dXJlID0ge1xyXG4gICAgICAgIGdlb21ldHJ5OiBnZW9tZXRyeSxcclxuICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgIHRhZ3M6IHRhZ3MgfHwgbnVsbCxcclxuICAgICAgICBtaW46IFsyLCAxXSwgLy8gaW5pdGlhbCBiYm94IHZhbHVlcztcclxuICAgICAgICBtYXg6IFstMSwgMF0gIC8vIG5vdGUgdGhhdCBjb29yZHMgYXJlIHVzdWFsbHkgaW4gWzAuLjFdIHJhbmdlXHJcbiAgICB9O1xyXG4gICAgY2FsY0JCb3goZmVhdHVyZSk7XHJcbiAgICByZXR1cm4gZmVhdHVyZTtcclxufVxyXG5cclxuZnVuY3Rpb24gcHJvamVjdChsb25sYXRzLCB0b2xlcmFuY2UpIHtcclxuICAgIHZhciBwcm9qZWN0ZWQgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9ubGF0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHByb2plY3RlZC5wdXNoKHByb2plY3RQb2ludChsb25sYXRzW2ldKSk7XHJcbiAgICB9XHJcbiAgICBpZiAodG9sZXJhbmNlKSB7XHJcbiAgICAgICAgc2ltcGxpZnkocHJvamVjdGVkLCB0b2xlcmFuY2UpO1xyXG4gICAgICAgIGNhbGNTaXplKHByb2plY3RlZCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJvamVjdGVkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwcm9qZWN0UG9pbnQocCkge1xyXG4gICAgdmFyIHNpbiA9IE1hdGguc2luKHBbMV0gKiBNYXRoLlBJIC8gMTgwKSxcclxuICAgICAgICB4ID0gKHBbMF0gLyAzNjAgKyAwLjUpLFxyXG4gICAgICAgIHkgPSAoMC41IC0gMC4yNSAqIE1hdGgubG9nKCgxICsgc2luKSAvICgxIC0gc2luKSkgLyBNYXRoLlBJKTtcclxuXHJcbiAgICB5ID0geSA8IDAgPyAwIDpcclxuICAgICAgICB5ID4gMSA/IDEgOiB5O1xyXG5cclxuICAgIHJldHVybiBbeCwgeSwgMF07XHJcbn1cclxuXHJcbi8vIGNhbGN1bGF0ZSBhcmVhIGFuZCBsZW5ndGggb2YgdGhlIHBvbHlcclxuZnVuY3Rpb24gY2FsY1NpemUocG9pbnRzKSB7XHJcbiAgICB2YXIgYXJlYSA9IDAsXHJcbiAgICAgICAgZGlzdCA9IDA7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGEsIGI7IGkgPCBwb2ludHMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgYSA9IGIgfHwgcG9pbnRzW2ldO1xyXG4gICAgICAgIGIgPSBwb2ludHNbaSArIDFdO1xyXG5cclxuICAgICAgICBhcmVhICs9IGFbMF0gKiBiWzFdIC0gYlswXSAqIGFbMV07XHJcblxyXG4gICAgICAgIC8vIHVzZSBNYW5oYXR0YW4gZGlzdGFuY2UgaW5zdGVhZCBvZiBFdWNsaWRpYW4gb25lIHRvIGF2b2lkIGV4cGVuc2l2ZSBzcXVhcmUgcm9vdCBjb21wdXRhdGlvblxyXG4gICAgICAgIGRpc3QgKz0gTWF0aC5hYnMoYlswXSAtIGFbMF0pICsgTWF0aC5hYnMoYlsxXSAtIGFbMV0pO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLmFyZWEgPSBNYXRoLmFicyhhcmVhIC8gMik7XHJcbiAgICBwb2ludHMuZGlzdCA9IGRpc3Q7XHJcbn1cclxuXHJcbi8vIGNhbGN1bGF0ZSB0aGUgZmVhdHVyZSBib3VuZGluZyBib3ggZm9yIGZhc3RlciBjbGlwcGluZyBsYXRlclxyXG5mdW5jdGlvbiBjYWxjQkJveChmZWF0dXJlKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBmZWF0dXJlLmdlb21ldHJ5LFxyXG4gICAgICAgIG1pbiA9IGZlYXR1cmUubWluLFxyXG4gICAgICAgIG1heCA9IGZlYXR1cmUubWF4O1xyXG5cclxuICAgIGlmIChmZWF0dXJlLnR5cGUgPT09IDEpIGNhbGNSaW5nQkJveChtaW4sIG1heCwgZ2VvbWV0cnkpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gMDsgaSA8IGdlb21ldHJ5Lmxlbmd0aDsgaSsrKSBjYWxjUmluZ0JCb3gobWluLCBtYXgsIGdlb21ldHJ5W2ldKTtcclxuXHJcbiAgICByZXR1cm4gZmVhdHVyZTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2FsY1JpbmdCQm94KG1pbiwgbWF4LCBwb2ludHMpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBwOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgcCA9IHBvaW50c1tpXTtcclxuICAgICAgICBtaW5bMF0gPSBNYXRoLm1pbihwWzBdLCBtaW5bMF0pO1xyXG4gICAgICAgIG1heFswXSA9IE1hdGgubWF4KHBbMF0sIG1heFswXSk7XHJcbiAgICAgICAgbWluWzFdID0gTWF0aC5taW4ocFsxXSwgbWluWzFdKTtcclxuICAgICAgICBtYXhbMV0gPSBNYXRoLm1heChwWzFdLCBtYXhbMV0pO1xyXG4gICAgfVxyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZ2VvanNvbnZ0O1xyXG5cclxudmFyIGNvbnZlcnQgPSByZXF1aXJlKCcuL2NvbnZlcnQnKSwgICAgIC8vIEdlb0pTT04gY29udmVyc2lvbiBhbmQgcHJlcHJvY2Vzc2luZ1xyXG4gICAgdHJhbnNmb3JtID0gcmVxdWlyZSgnLi90cmFuc2Zvcm0nKSwgLy8gY29vcmRpbmF0ZSB0cmFuc2Zvcm1hdGlvblxyXG4gICAgY2xpcCA9IHJlcXVpcmUoJy4vY2xpcCcpLCAgICAgICAgICAgLy8gc3RyaXBlIGNsaXBwaW5nIGFsZ29yaXRobVxyXG4gICAgd3JhcCA9IHJlcXVpcmUoJy4vd3JhcCcpLCAgICAgICAgICAgLy8gZGF0ZSBsaW5lIHByb2Nlc3NpbmdcclxuICAgIGNyZWF0ZVRpbGUgPSByZXF1aXJlKCcuL3RpbGUnKTsgICAgIC8vIGZpbmFsIHNpbXBsaWZpZWQgdGlsZSBnZW5lcmF0aW9uXHJcblxyXG5cclxuZnVuY3Rpb24gZ2VvanNvbnZ0KGRhdGEsIG9wdGlvbnMpIHtcclxuICAgIHJldHVybiBuZXcgR2VvSlNPTlZUKGRhdGEsIG9wdGlvbnMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBHZW9KU09OVlQoZGF0YSwgb3B0aW9ucykge1xyXG4gICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyA9IGV4dGVuZChPYmplY3QuY3JlYXRlKHRoaXMub3B0aW9ucyksIG9wdGlvbnMpO1xyXG5cclxuICAgIHZhciBkZWJ1ZyA9IG9wdGlvbnMuZGVidWc7XHJcblxyXG4gICAgaWYgKGRlYnVnKSBjb25zb2xlLnRpbWUoJ3ByZXByb2Nlc3MgZGF0YScpO1xyXG5cclxuICAgIHZhciB6MiA9IDEgPDwgb3B0aW9ucy5tYXhab29tLCAvLyAyXnpcclxuICAgICAgICBmZWF0dXJlcyA9IGNvbnZlcnQoZGF0YSwgb3B0aW9ucy50b2xlcmFuY2UgLyAoejIgKiBvcHRpb25zLmV4dGVudCkpO1xyXG5cclxuICAgIHRoaXMudGlsZXMgPSB7fTtcclxuICAgIHRoaXMudGlsZUNvb3JkcyA9IFtdO1xyXG5cclxuICAgIGlmIChkZWJ1Zykge1xyXG4gICAgICAgIGNvbnNvbGUudGltZUVuZCgncHJlcHJvY2VzcyBkYXRhJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2luZGV4OiBtYXhab29tOiAlZCwgbWF4UG9pbnRzOiAlZCcsIG9wdGlvbnMuaW5kZXhNYXhab29tLCBvcHRpb25zLmluZGV4TWF4UG9pbnRzKTtcclxuICAgICAgICBjb25zb2xlLnRpbWUoJ2dlbmVyYXRlIHRpbGVzJyk7XHJcbiAgICAgICAgdGhpcy5zdGF0cyA9IHt9O1xyXG4gICAgICAgIHRoaXMudG90YWwgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGZlYXR1cmVzID0gd3JhcChmZWF0dXJlcywgb3B0aW9ucy5idWZmZXIgLyBvcHRpb25zLmV4dGVudCwgaW50ZXJzZWN0WCk7XHJcblxyXG4gICAgLy8gc3RhcnQgc2xpY2luZyBmcm9tIHRoZSB0b3AgdGlsZSBkb3duXHJcbiAgICBpZiAoZmVhdHVyZXMubGVuZ3RoKSB0aGlzLnNwbGl0VGlsZShmZWF0dXJlcywgMCwgMCwgMCk7XHJcblxyXG4gICAgaWYgKGRlYnVnKSB7XHJcbiAgICAgICAgaWYgKGZlYXR1cmVzLmxlbmd0aCkgY29uc29sZS5sb2coJ2ZlYXR1cmVzOiAlZCwgcG9pbnRzOiAlZCcsIHRoaXMudGlsZXNbMF0ubnVtRmVhdHVyZXMsIHRoaXMudGlsZXNbMF0ubnVtUG9pbnRzKTtcclxuICAgICAgICBjb25zb2xlLnRpbWVFbmQoJ2dlbmVyYXRlIHRpbGVzJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3RpbGVzIGdlbmVyYXRlZDonLCB0aGlzLnRvdGFsLCBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRzKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkdlb0pTT05WVC5wcm90b3R5cGUub3B0aW9ucyA9IHtcclxuICAgIG1heFpvb206IDE0LCAgICAgICAgICAgIC8vIG1heCB6b29tIHRvIHByZXNlcnZlIGRldGFpbCBvblxyXG4gICAgaW5kZXhNYXhab29tOiA1LCAgICAgICAgLy8gbWF4IHpvb20gaW4gdGhlIHRpbGUgaW5kZXhcclxuICAgIGluZGV4TWF4UG9pbnRzOiAxMDAwMDAsIC8vIG1heCBudW1iZXIgb2YgcG9pbnRzIHBlciB0aWxlIGluIHRoZSB0aWxlIGluZGV4XHJcbiAgICBzb2xpZENoaWxkcmVuOiBmYWxzZSwgICAvLyB3aGV0aGVyIHRvIHRpbGUgc29saWQgc3F1YXJlIHRpbGVzIGZ1cnRoZXJcclxuICAgIHRvbGVyYW5jZTogMywgICAgICAgICAgIC8vIHNpbXBsaWZpY2F0aW9uIHRvbGVyYW5jZSAoaGlnaGVyIG1lYW5zIHNpbXBsZXIpXHJcbiAgICBleHRlbnQ6IDQwOTYsICAgICAgICAgICAvLyB0aWxlIGV4dGVudFxyXG4gICAgYnVmZmVyOiA2NCwgICAgICAgICAgICAgLy8gdGlsZSBidWZmZXIgb24gZWFjaCBzaWRlXHJcbiAgICBkZWJ1ZzogMCAgICAgICAgICAgICAgICAvLyBsb2dnaW5nIGxldmVsICgwLCAxIG9yIDIpXHJcbn07XHJcblxyXG5HZW9KU09OVlQucHJvdG90eXBlLnNwbGl0VGlsZSA9IGZ1bmN0aW9uIChmZWF0dXJlcywgeiwgeCwgeSwgY3osIGN4LCBjeSkge1xyXG5cclxuICAgIHZhciBzdGFjayA9IFtmZWF0dXJlcywgeiwgeCwgeV0sXHJcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcclxuICAgICAgICBkZWJ1ZyA9IG9wdGlvbnMuZGVidWcsXHJcbiAgICAgICAgc29saWQgPSBudWxsO1xyXG5cclxuICAgIC8vIGF2b2lkIHJlY3Vyc2lvbiBieSB1c2luZyBhIHByb2Nlc3NpbmcgcXVldWVcclxuICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIHtcclxuICAgICAgICB5ID0gc3RhY2sucG9wKCk7XHJcbiAgICAgICAgeCA9IHN0YWNrLnBvcCgpO1xyXG4gICAgICAgIHogPSBzdGFjay5wb3AoKTtcclxuICAgICAgICBmZWF0dXJlcyA9IHN0YWNrLnBvcCgpO1xyXG5cclxuICAgICAgICB2YXIgejIgPSAxIDw8IHosXHJcbiAgICAgICAgICAgIGlkID0gdG9JRCh6LCB4LCB5KSxcclxuICAgICAgICAgICAgdGlsZSA9IHRoaXMudGlsZXNbaWRdLFxyXG4gICAgICAgICAgICB0aWxlVG9sZXJhbmNlID0geiA9PT0gb3B0aW9ucy5tYXhab29tID8gMCA6IG9wdGlvbnMudG9sZXJhbmNlIC8gKHoyICogb3B0aW9ucy5leHRlbnQpO1xyXG5cclxuICAgICAgICBpZiAoIXRpbGUpIHtcclxuICAgICAgICAgICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS50aW1lKCdjcmVhdGlvbicpO1xyXG5cclxuICAgICAgICAgICAgdGlsZSA9IHRoaXMudGlsZXNbaWRdID0gY3JlYXRlVGlsZShmZWF0dXJlcywgejIsIHgsIHksIHRpbGVUb2xlcmFuY2UsIHogPT09IG9wdGlvbnMubWF4Wm9vbSk7XHJcbiAgICAgICAgICAgIHRoaXMudGlsZUNvb3Jkcy5wdXNoKHt6OiB6LCB4OiB4LCB5OiB5fSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVidWcpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkZWJ1ZyA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndGlsZSB6JWQtJWQtJWQgKGZlYXR1cmVzOiAlZCwgcG9pbnRzOiAlZCwgc2ltcGxpZmllZDogJWQpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeiwgeCwgeSwgdGlsZS5udW1GZWF0dXJlcywgdGlsZS5udW1Qb2ludHMsIHRpbGUubnVtU2ltcGxpZmllZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS50aW1lRW5kKCdjcmVhdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGtleSA9ICd6JyArIHo7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRzW2tleV0gPSAodGhpcy5zdGF0c1trZXldIHx8IDApICsgMTtcclxuICAgICAgICAgICAgICAgIHRoaXMudG90YWwrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgZ2VvbWV0cnkgaW4gdGlsZSBzbyB0aGF0IHdlIGNhbiBkcmlsbCBkb3duIGxhdGVyIGlmIHdlIHN0b3Agbm93XHJcbiAgICAgICAgdGlsZS5zb3VyY2UgPSBmZWF0dXJlcztcclxuXHJcbiAgICAgICAgLy8gaWYgaXQncyB0aGUgZmlyc3QtcGFzcyB0aWxpbmdcclxuICAgICAgICBpZiAoIWN6KSB7XHJcbiAgICAgICAgICAgIC8vIHN0b3AgdGlsaW5nIGlmIHdlIHJlYWNoZWQgbWF4IHpvb20sIG9yIGlmIHRoZSB0aWxlIGlzIHRvbyBzaW1wbGVcclxuICAgICAgICAgICAgaWYgKHogPT09IG9wdGlvbnMuaW5kZXhNYXhab29tIHx8IHRpbGUubnVtUG9pbnRzIDw9IG9wdGlvbnMuaW5kZXhNYXhQb2ludHMpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAvLyBpZiBhIGRyaWxsZG93biB0byBhIHNwZWNpZmljIHRpbGVcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBzdG9wIHRpbGluZyBpZiB3ZSByZWFjaGVkIGJhc2Ugem9vbSBvciBvdXIgdGFyZ2V0IHRpbGUgem9vbVxyXG4gICAgICAgICAgICBpZiAoeiA9PT0gb3B0aW9ucy5tYXhab29tIHx8IHogPT09IGN6KSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIHN0b3AgdGlsaW5nIGlmIGl0J3Mgbm90IGFuIGFuY2VzdG9yIG9mIHRoZSB0YXJnZXQgdGlsZVxyXG4gICAgICAgICAgICB2YXIgbSA9IDEgPDwgKGN6IC0geik7XHJcbiAgICAgICAgICAgIGlmICh4ICE9PSBNYXRoLmZsb29yKGN4IC8gbSkgfHwgeSAhPT0gTWF0aC5mbG9vcihjeSAvIG0pKSBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHN0b3AgdGlsaW5nIGlmIHRoZSB0aWxlIGlzIHNvbGlkIGNsaXBwZWQgc3F1YXJlXHJcbiAgICAgICAgaWYgKCFvcHRpb25zLnNvbGlkQ2hpbGRyZW4gJiYgaXNDbGlwcGVkU3F1YXJlKHRpbGUsIG9wdGlvbnMuZXh0ZW50LCBvcHRpb25zLmJ1ZmZlcikpIHtcclxuICAgICAgICAgICAgaWYgKGN6KSBzb2xpZCA9IHo7IC8vIGFuZCByZW1lbWJlciB0aGUgem9vbSBpZiB3ZSdyZSBkcmlsbGluZyBkb3duXHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaWYgd2Ugc2xpY2UgZnVydGhlciBkb3duLCBubyBuZWVkIHRvIGtlZXAgc291cmNlIGdlb21ldHJ5XHJcbiAgICAgICAgdGlsZS5zb3VyY2UgPSBudWxsO1xyXG5cclxuICAgICAgICBpZiAoZGVidWcgPiAxKSBjb25zb2xlLnRpbWUoJ2NsaXBwaW5nJyk7XHJcblxyXG4gICAgICAgIC8vIHZhbHVlcyB3ZSdsbCB1c2UgZm9yIGNsaXBwaW5nXHJcbiAgICAgICAgdmFyIGsxID0gMC41ICogb3B0aW9ucy5idWZmZXIgLyBvcHRpb25zLmV4dGVudCxcclxuICAgICAgICAgICAgazIgPSAwLjUgLSBrMSxcclxuICAgICAgICAgICAgazMgPSAwLjUgKyBrMSxcclxuICAgICAgICAgICAgazQgPSAxICsgazEsXHJcbiAgICAgICAgICAgIHRsLCBibCwgdHIsIGJyLCBsZWZ0LCByaWdodDtcclxuXHJcbiAgICAgICAgdGwgPSBibCA9IHRyID0gYnIgPSBudWxsO1xyXG5cclxuICAgICAgICBsZWZ0ICA9IGNsaXAoZmVhdHVyZXMsIHoyLCB4IC0gazEsIHggKyBrMywgMCwgaW50ZXJzZWN0WCwgdGlsZS5taW5bMF0sIHRpbGUubWF4WzBdKTtcclxuICAgICAgICByaWdodCA9IGNsaXAoZmVhdHVyZXMsIHoyLCB4ICsgazIsIHggKyBrNCwgMCwgaW50ZXJzZWN0WCwgdGlsZS5taW5bMF0sIHRpbGUubWF4WzBdKTtcclxuXHJcbiAgICAgICAgaWYgKGxlZnQpIHtcclxuICAgICAgICAgICAgdGwgPSBjbGlwKGxlZnQsIHoyLCB5IC0gazEsIHkgKyBrMywgMSwgaW50ZXJzZWN0WSwgdGlsZS5taW5bMV0sIHRpbGUubWF4WzFdKTtcclxuICAgICAgICAgICAgYmwgPSBjbGlwKGxlZnQsIHoyLCB5ICsgazIsIHkgKyBrNCwgMSwgaW50ZXJzZWN0WSwgdGlsZS5taW5bMV0sIHRpbGUubWF4WzFdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChyaWdodCkge1xyXG4gICAgICAgICAgICB0ciA9IGNsaXAocmlnaHQsIHoyLCB5IC0gazEsIHkgKyBrMywgMSwgaW50ZXJzZWN0WSwgdGlsZS5taW5bMV0sIHRpbGUubWF4WzFdKTtcclxuICAgICAgICAgICAgYnIgPSBjbGlwKHJpZ2h0LCB6MiwgeSArIGsyLCB5ICsgazQsIDEsIGludGVyc2VjdFksIHRpbGUubWluWzFdLCB0aWxlLm1heFsxXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZGVidWcgPiAxKSBjb25zb2xlLnRpbWVFbmQoJ2NsaXBwaW5nJyk7XHJcblxyXG4gICAgICAgIGlmICh0bCkgc3RhY2sucHVzaCh0bCwgeiArIDEsIHggKiAyLCAgICAgeSAqIDIpO1xyXG4gICAgICAgIGlmIChibCkgc3RhY2sucHVzaChibCwgeiArIDEsIHggKiAyLCAgICAgeSAqIDIgKyAxKTtcclxuICAgICAgICBpZiAodHIpIHN0YWNrLnB1c2godHIsIHogKyAxLCB4ICogMiArIDEsIHkgKiAyKTtcclxuICAgICAgICBpZiAoYnIpIHN0YWNrLnB1c2goYnIsIHogKyAxLCB4ICogMiArIDEsIHkgKiAyICsgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNvbGlkO1xyXG59O1xyXG5cclxuR2VvSlNPTlZULnByb3RvdHlwZS5nZXRUaWxlID0gZnVuY3Rpb24gKHosIHgsIHkpIHtcclxuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxyXG4gICAgICAgIGV4dGVudCA9IG9wdGlvbnMuZXh0ZW50LFxyXG4gICAgICAgIGRlYnVnID0gb3B0aW9ucy5kZWJ1ZztcclxuXHJcbiAgICB2YXIgejIgPSAxIDw8IHo7XHJcbiAgICB4ID0gKCh4ICUgejIpICsgejIpICUgejI7IC8vIHdyYXAgdGlsZSB4IGNvb3JkaW5hdGVcclxuXHJcbiAgICB2YXIgaWQgPSB0b0lEKHosIHgsIHkpO1xyXG4gICAgaWYgKHRoaXMudGlsZXNbaWRdKSByZXR1cm4gdHJhbnNmb3JtLnRpbGUodGhpcy50aWxlc1tpZF0sIGV4dGVudCk7XHJcblxyXG4gICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS5sb2coJ2RyaWxsaW5nIGRvd24gdG8geiVkLSVkLSVkJywgeiwgeCwgeSk7XHJcblxyXG4gICAgdmFyIHowID0geixcclxuICAgICAgICB4MCA9IHgsXHJcbiAgICAgICAgeTAgPSB5LFxyXG4gICAgICAgIHBhcmVudDtcclxuXHJcbiAgICB3aGlsZSAoIXBhcmVudCAmJiB6MCA+IDApIHtcclxuICAgICAgICB6MC0tO1xyXG4gICAgICAgIHgwID0gTWF0aC5mbG9vcih4MCAvIDIpO1xyXG4gICAgICAgIHkwID0gTWF0aC5mbG9vcih5MCAvIDIpO1xyXG4gICAgICAgIHBhcmVudCA9IHRoaXMudGlsZXNbdG9JRCh6MCwgeDAsIHkwKV07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFwYXJlbnQgfHwgIXBhcmVudC5zb3VyY2UpIHJldHVybiBudWxsO1xyXG5cclxuICAgIC8vIGlmIHdlIGZvdW5kIGEgcGFyZW50IHRpbGUgY29udGFpbmluZyB0aGUgb3JpZ2luYWwgZ2VvbWV0cnksIHdlIGNhbiBkcmlsbCBkb3duIGZyb20gaXRcclxuICAgIGlmIChkZWJ1ZyA+IDEpIGNvbnNvbGUubG9nKCdmb3VuZCBwYXJlbnQgdGlsZSB6JWQtJWQtJWQnLCB6MCwgeDAsIHkwKTtcclxuXHJcbiAgICAvLyBpdCBwYXJlbnQgdGlsZSBpcyBhIHNvbGlkIGNsaXBwZWQgc3F1YXJlLCByZXR1cm4gaXQgaW5zdGVhZCBzaW5jZSBpdCdzIGlkZW50aWNhbFxyXG4gICAgaWYgKGlzQ2xpcHBlZFNxdWFyZShwYXJlbnQsIGV4dGVudCwgb3B0aW9ucy5idWZmZXIpKSByZXR1cm4gdHJhbnNmb3JtLnRpbGUocGFyZW50LCBleHRlbnQpO1xyXG5cclxuICAgIGlmIChkZWJ1ZyA+IDEpIGNvbnNvbGUudGltZSgnZHJpbGxpbmcgZG93bicpO1xyXG4gICAgdmFyIHNvbGlkID0gdGhpcy5zcGxpdFRpbGUocGFyZW50LnNvdXJjZSwgejAsIHgwLCB5MCwgeiwgeCwgeSk7XHJcbiAgICBpZiAoZGVidWcgPiAxKSBjb25zb2xlLnRpbWVFbmQoJ2RyaWxsaW5nIGRvd24nKTtcclxuXHJcbiAgICAvLyBvbmUgb2YgdGhlIHBhcmVudCB0aWxlcyB3YXMgYSBzb2xpZCBjbGlwcGVkIHNxdWFyZVxyXG4gICAgaWYgKHNvbGlkICE9PSBudWxsKSB7XHJcbiAgICAgICAgdmFyIG0gPSAxIDw8ICh6IC0gc29saWQpO1xyXG4gICAgICAgIGlkID0gdG9JRChzb2xpZCwgTWF0aC5mbG9vcih4IC8gbSksIE1hdGguZmxvb3IoeSAvIG0pKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy50aWxlc1tpZF0gPyB0cmFuc2Zvcm0udGlsZSh0aGlzLnRpbGVzW2lkXSwgZXh0ZW50KSA6IG51bGw7XHJcbn07XHJcblxyXG5mdW5jdGlvbiB0b0lEKHosIHgsIHkpIHtcclxuICAgIHJldHVybiAoKCgxIDw8IHopICogeSArIHgpICogMzIpICsgejtcclxufVxyXG5cclxuZnVuY3Rpb24gaW50ZXJzZWN0WChhLCBiLCB4KSB7XHJcbiAgICByZXR1cm4gW3gsICh4IC0gYVswXSkgKiAoYlsxXSAtIGFbMV0pIC8gKGJbMF0gLSBhWzBdKSArIGFbMV0sIDFdO1xyXG59XHJcbmZ1bmN0aW9uIGludGVyc2VjdFkoYSwgYiwgeSkge1xyXG4gICAgcmV0dXJuIFsoeSAtIGFbMV0pICogKGJbMF0gLSBhWzBdKSAvIChiWzFdIC0gYVsxXSkgKyBhWzBdLCB5LCAxXTtcclxufVxyXG5cclxuZnVuY3Rpb24gZXh0ZW5kKGRlc3QsIHNyYykge1xyXG4gICAgZm9yICh2YXIgaSBpbiBzcmMpIGRlc3RbaV0gPSBzcmNbaV07XHJcbiAgICByZXR1cm4gZGVzdDtcclxufVxyXG5cclxuLy8gY2hlY2tzIHdoZXRoZXIgYSB0aWxlIGlzIGEgd2hvbGUtYXJlYSBmaWxsIGFmdGVyIGNsaXBwaW5nOyBpZiBpdCBpcywgdGhlcmUncyBubyBzZW5zZSBzbGljaW5nIGl0IGZ1cnRoZXJcclxuZnVuY3Rpb24gaXNDbGlwcGVkU3F1YXJlKHRpbGUsIGV4dGVudCwgYnVmZmVyKSB7XHJcblxyXG4gICAgdmFyIGZlYXR1cmVzID0gdGlsZS5zb3VyY2U7XHJcbiAgICBpZiAoZmVhdHVyZXMubGVuZ3RoICE9PSAxKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgdmFyIGZlYXR1cmUgPSBmZWF0dXJlc1swXTtcclxuICAgIGlmIChmZWF0dXJlLnR5cGUgIT09IDMgfHwgZmVhdHVyZS5nZW9tZXRyeS5sZW5ndGggPiAxKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgdmFyIGxlbiA9IGZlYXR1cmUuZ2VvbWV0cnlbMF0ubGVuZ3RoO1xyXG4gICAgaWYgKGxlbiAhPT0gNSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICB2YXIgcCA9IHRyYW5zZm9ybS5wb2ludChmZWF0dXJlLmdlb21ldHJ5WzBdW2ldLCBleHRlbnQsIHRpbGUuejIsIHRpbGUueCwgdGlsZS55KTtcclxuICAgICAgICBpZiAoKHBbMF0gIT09IC1idWZmZXIgJiYgcFswXSAhPT0gZXh0ZW50ICsgYnVmZmVyKSB8fFxyXG4gICAgICAgICAgICAocFsxXSAhPT0gLWJ1ZmZlciAmJiBwWzFdICE9PSBleHRlbnQgKyBidWZmZXIpKSByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzaW1wbGlmeTtcclxuXHJcbi8vIGNhbGN1bGF0ZSBzaW1wbGlmaWNhdGlvbiBkYXRhIHVzaW5nIG9wdGltaXplZCBEb3VnbGFzLVBldWNrZXIgYWxnb3JpdGhtXHJcblxyXG5mdW5jdGlvbiBzaW1wbGlmeShwb2ludHMsIHRvbGVyYW5jZSkge1xyXG5cclxuICAgIHZhciBzcVRvbGVyYW5jZSA9IHRvbGVyYW5jZSAqIHRvbGVyYW5jZSxcclxuICAgICAgICBsZW4gPSBwb2ludHMubGVuZ3RoLFxyXG4gICAgICAgIGZpcnN0ID0gMCxcclxuICAgICAgICBsYXN0ID0gbGVuIC0gMSxcclxuICAgICAgICBzdGFjayA9IFtdLFxyXG4gICAgICAgIGksIG1heFNxRGlzdCwgc3FEaXN0LCBpbmRleDtcclxuXHJcbiAgICAvLyBhbHdheXMgcmV0YWluIHRoZSBlbmRwb2ludHMgKDEgaXMgdGhlIG1heCB2YWx1ZSlcclxuICAgIHBvaW50c1tmaXJzdF1bMl0gPSAxO1xyXG4gICAgcG9pbnRzW2xhc3RdWzJdID0gMTtcclxuXHJcbiAgICAvLyBhdm9pZCByZWN1cnNpb24gYnkgdXNpbmcgYSBzdGFja1xyXG4gICAgd2hpbGUgKGxhc3QpIHtcclxuXHJcbiAgICAgICAgbWF4U3FEaXN0ID0gMDtcclxuXHJcbiAgICAgICAgZm9yIChpID0gZmlyc3QgKyAxOyBpIDwgbGFzdDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHNxRGlzdCA9IGdldFNxU2VnRGlzdChwb2ludHNbaV0sIHBvaW50c1tmaXJzdF0sIHBvaW50c1tsYXN0XSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc3FEaXN0ID4gbWF4U3FEaXN0KSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgICBtYXhTcURpc3QgPSBzcURpc3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtYXhTcURpc3QgPiBzcVRvbGVyYW5jZSkge1xyXG4gICAgICAgICAgICBwb2ludHNbaW5kZXhdWzJdID0gbWF4U3FEaXN0OyAvLyBzYXZlIHRoZSBwb2ludCBpbXBvcnRhbmNlIGluIHNxdWFyZWQgcGl4ZWxzIGFzIGEgeiBjb29yZGluYXRlXHJcbiAgICAgICAgICAgIHN0YWNrLnB1c2goZmlyc3QpO1xyXG4gICAgICAgICAgICBzdGFjay5wdXNoKGluZGV4KTtcclxuICAgICAgICAgICAgZmlyc3QgPSBpbmRleDtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGFzdCA9IHN0YWNrLnBvcCgpO1xyXG4gICAgICAgICAgICBmaXJzdCA9IHN0YWNrLnBvcCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gc3F1YXJlIGRpc3RhbmNlIGZyb20gYSBwb2ludCB0byBhIHNlZ21lbnRcclxuZnVuY3Rpb24gZ2V0U3FTZWdEaXN0KHAsIGEsIGIpIHtcclxuXHJcbiAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLFxyXG4gICAgICAgIGJ4ID0gYlswXSwgYnkgPSBiWzFdLFxyXG4gICAgICAgIHB4ID0gcFswXSwgcHkgPSBwWzFdLFxyXG4gICAgICAgIGR4ID0gYnggLSB4LFxyXG4gICAgICAgIGR5ID0gYnkgLSB5O1xyXG5cclxuICAgIGlmIChkeCAhPT0gMCB8fCBkeSAhPT0gMCkge1xyXG5cclxuICAgICAgICB2YXIgdCA9ICgocHggLSB4KSAqIGR4ICsgKHB5IC0geSkgKiBkeSkgLyAoZHggKiBkeCArIGR5ICogZHkpO1xyXG5cclxuICAgICAgICBpZiAodCA+IDEpIHtcclxuICAgICAgICAgICAgeCA9IGJ4O1xyXG4gICAgICAgICAgICB5ID0gYnk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAodCA+IDApIHtcclxuICAgICAgICAgICAgeCArPSBkeCAqIHQ7XHJcbiAgICAgICAgICAgIHkgKz0gZHkgKiB0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkeCA9IHB4IC0geDtcclxuICAgIGR5ID0gcHkgLSB5O1xyXG5cclxuICAgIHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeTtcclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVRpbGU7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVUaWxlKGZlYXR1cmVzLCB6MiwgdHgsIHR5LCB0b2xlcmFuY2UsIG5vU2ltcGxpZnkpIHtcclxuICAgIHZhciB0aWxlID0ge1xyXG4gICAgICAgIGZlYXR1cmVzOiBbXSxcclxuICAgICAgICBudW1Qb2ludHM6IDAsXHJcbiAgICAgICAgbnVtU2ltcGxpZmllZDogMCxcclxuICAgICAgICBudW1GZWF0dXJlczogMCxcclxuICAgICAgICBzb3VyY2U6IG51bGwsXHJcbiAgICAgICAgeDogdHgsXHJcbiAgICAgICAgeTogdHksXHJcbiAgICAgICAgejI6IHoyLFxyXG4gICAgICAgIHRyYW5zZm9ybWVkOiBmYWxzZSxcclxuICAgICAgICBtaW46IFsyLCAxXSxcclxuICAgICAgICBtYXg6IFstMSwgMF1cclxuICAgIH07XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdGlsZS5udW1GZWF0dXJlcysrO1xyXG4gICAgICAgIGFkZEZlYXR1cmUodGlsZSwgZmVhdHVyZXNbaV0sIHRvbGVyYW5jZSwgbm9TaW1wbGlmeSk7XHJcblxyXG4gICAgICAgIHZhciBtaW4gPSBmZWF0dXJlc1tpXS5taW4sXHJcbiAgICAgICAgICAgIG1heCA9IGZlYXR1cmVzW2ldLm1heDtcclxuXHJcbiAgICAgICAgaWYgKG1pblswXSA8IHRpbGUubWluWzBdKSB0aWxlLm1pblswXSA9IG1pblswXTtcclxuICAgICAgICBpZiAobWluWzFdIDwgdGlsZS5taW5bMV0pIHRpbGUubWluWzFdID0gbWluWzFdO1xyXG4gICAgICAgIGlmIChtYXhbMF0gPiB0aWxlLm1heFswXSkgdGlsZS5tYXhbMF0gPSBtYXhbMF07XHJcbiAgICAgICAgaWYgKG1heFsxXSA+IHRpbGUubWF4WzFdKSB0aWxlLm1heFsxXSA9IG1heFsxXTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aWxlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRGZWF0dXJlKHRpbGUsIGZlYXR1cmUsIHRvbGVyYW5jZSwgbm9TaW1wbGlmeSkge1xyXG5cclxuICAgIHZhciBnZW9tID0gZmVhdHVyZS5nZW9tZXRyeSxcclxuICAgICAgICB0eXBlID0gZmVhdHVyZS50eXBlLFxyXG4gICAgICAgIHNpbXBsaWZpZWQgPSBbXSxcclxuICAgICAgICBzcVRvbGVyYW5jZSA9IHRvbGVyYW5jZSAqIHRvbGVyYW5jZSxcclxuICAgICAgICBpLCBqLCByaW5nLCBwO1xyXG5cclxuICAgIGlmICh0eXBlID09PSAxKSB7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGdlb20ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgc2ltcGxpZmllZC5wdXNoKGdlb21baV0pO1xyXG4gICAgICAgICAgICB0aWxlLm51bVBvaW50cysrO1xyXG4gICAgICAgICAgICB0aWxlLm51bVNpbXBsaWZpZWQrKztcclxuICAgICAgICB9XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gc2ltcGxpZnkgYW5kIHRyYW5zZm9ybSBwcm9qZWN0ZWQgY29vcmRpbmF0ZXMgZm9yIHRpbGUgZ2VvbWV0cnlcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZ2VvbS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICByaW5nID0gZ2VvbVtpXTtcclxuXHJcbiAgICAgICAgICAgIC8vIGZpbHRlciBvdXQgdGlueSBwb2x5bGluZXMgJiBwb2x5Z29uc1xyXG4gICAgICAgICAgICBpZiAoIW5vU2ltcGxpZnkgJiYgKCh0eXBlID09PSAyICYmIHJpbmcuZGlzdCA8IHRvbGVyYW5jZSkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodHlwZSA9PT0gMyAmJiByaW5nLmFyZWEgPCBzcVRvbGVyYW5jZSkpKSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlLm51bVBvaW50cyArPSByaW5nLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgc2ltcGxpZmllZFJpbmcgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCByaW5nLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBwID0gcmluZ1tqXTtcclxuICAgICAgICAgICAgICAgIC8vIGtlZXAgcG9pbnRzIHdpdGggaW1wb3J0YW5jZSA+IHRvbGVyYW5jZVxyXG4gICAgICAgICAgICAgICAgaWYgKG5vU2ltcGxpZnkgfHwgcFsyXSA+IHNxVG9sZXJhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2ltcGxpZmllZFJpbmcucHVzaChwKTtcclxuICAgICAgICAgICAgICAgICAgICB0aWxlLm51bVNpbXBsaWZpZWQrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRpbGUubnVtUG9pbnRzKys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNpbXBsaWZpZWQucHVzaChzaW1wbGlmaWVkUmluZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzaW1wbGlmaWVkLmxlbmd0aCkge1xyXG4gICAgICAgIHRpbGUuZmVhdHVyZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGdlb21ldHJ5OiBzaW1wbGlmaWVkLFxyXG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgICAgICB0YWdzOiBmZWF0dXJlLnRhZ3MgfHwgbnVsbFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmV4cG9ydHMudGlsZSA9IHRyYW5zZm9ybVRpbGU7XHJcbmV4cG9ydHMucG9pbnQgPSB0cmFuc2Zvcm1Qb2ludDtcclxuXHJcbi8vIFRyYW5zZm9ybXMgdGhlIGNvb3JkaW5hdGVzIG9mIGVhY2ggZmVhdHVyZSBpbiB0aGUgZ2l2ZW4gdGlsZSBmcm9tXHJcbi8vIG1lcmNhdG9yLXByb2plY3RlZCBzcGFjZSBpbnRvIChleHRlbnQgeCBleHRlbnQpIHRpbGUgc3BhY2UuXHJcbmZ1bmN0aW9uIHRyYW5zZm9ybVRpbGUodGlsZSwgZXh0ZW50KSB7XHJcbiAgICBpZiAodGlsZS50cmFuc2Zvcm1lZCkgcmV0dXJuIHRpbGU7XHJcblxyXG4gICAgdmFyIHoyID0gdGlsZS56MixcclxuICAgICAgICB0eCA9IHRpbGUueCxcclxuICAgICAgICB0eSA9IHRpbGUueSxcclxuICAgICAgICBpLCBqLCBrO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCB0aWxlLmZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGZlYXR1cmUgPSB0aWxlLmZlYXR1cmVzW2ldLFxyXG4gICAgICAgICAgICBnZW9tID0gZmVhdHVyZS5nZW9tZXRyeSxcclxuICAgICAgICAgICAgdHlwZSA9IGZlYXR1cmUudHlwZTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGUgPT09IDEpIHtcclxuICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IGdlb20ubGVuZ3RoOyBqKyspIGdlb21bal0gPSB0cmFuc2Zvcm1Qb2ludChnZW9tW2pdLCBleHRlbnQsIHoyLCB0eCwgdHkpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgZ2VvbS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJpbmcgPSBnZW9tW2pdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChrID0gMDsgayA8IHJpbmcubGVuZ3RoOyBrKyspIHJpbmdba10gPSB0cmFuc2Zvcm1Qb2ludChyaW5nW2tdLCBleHRlbnQsIHoyLCB0eCwgdHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRpbGUudHJhbnNmb3JtZWQgPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiB0aWxlO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0cmFuc2Zvcm1Qb2ludChwLCBleHRlbnQsIHoyLCB0eCwgdHkpIHtcclxuICAgIHZhciB4ID0gTWF0aC5yb3VuZChleHRlbnQgKiAocFswXSAqIHoyIC0gdHgpKSxcclxuICAgICAgICB5ID0gTWF0aC5yb3VuZChleHRlbnQgKiAocFsxXSAqIHoyIC0gdHkpKTtcclxuICAgIHJldHVybiBbeCwgeV07XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGNsaXAgPSByZXF1aXJlKCcuL2NsaXAnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gd3JhcDtcclxuXHJcbmZ1bmN0aW9uIHdyYXAoZmVhdHVyZXMsIGJ1ZmZlciwgaW50ZXJzZWN0WCkge1xyXG4gICAgdmFyIG1lcmdlZCA9IGZlYXR1cmVzLFxyXG4gICAgICAgIGxlZnQgID0gY2xpcChmZWF0dXJlcywgMSwgLTEgLSBidWZmZXIsIGJ1ZmZlciwgICAgIDAsIGludGVyc2VjdFgsIC0xLCAyKSwgLy8gbGVmdCB3b3JsZCBjb3B5XHJcbiAgICAgICAgcmlnaHQgPSBjbGlwKGZlYXR1cmVzLCAxLCAgMSAtIGJ1ZmZlciwgMiArIGJ1ZmZlciwgMCwgaW50ZXJzZWN0WCwgLTEsIDIpOyAvLyByaWdodCB3b3JsZCBjb3B5XHJcblxyXG4gICAgaWYgKGxlZnQgfHwgcmlnaHQpIHtcclxuICAgICAgICBtZXJnZWQgPSBjbGlwKGZlYXR1cmVzLCAxLCAtYnVmZmVyLCAxICsgYnVmZmVyLCAwLCBpbnRlcnNlY3RYLCAtMSwgMik7IC8vIGNlbnRlciB3b3JsZCBjb3B5XHJcblxyXG4gICAgICAgIGlmIChsZWZ0KSBtZXJnZWQgPSBzaGlmdEZlYXR1cmVDb29yZHMobGVmdCwgMSkuY29uY2F0KG1lcmdlZCk7IC8vIG1lcmdlIGxlZnQgaW50byBjZW50ZXJcclxuICAgICAgICBpZiAocmlnaHQpIG1lcmdlZCA9IG1lcmdlZC5jb25jYXQoc2hpZnRGZWF0dXJlQ29vcmRzKHJpZ2h0LCAtMSkpOyAvLyBtZXJnZSByaWdodCBpbnRvIGNlbnRlclxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBtZXJnZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNoaWZ0RmVhdHVyZUNvb3JkcyhmZWF0dXJlcywgb2Zmc2V0KSB7XHJcbiAgICB2YXIgbmV3RmVhdHVyZXMgPSBbXTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGZlYXR1cmUgPSBmZWF0dXJlc1tpXSxcclxuICAgICAgICAgICAgdHlwZSA9IGZlYXR1cmUudHlwZTtcclxuXHJcbiAgICAgICAgdmFyIG5ld0dlb21ldHJ5O1xyXG5cclxuICAgICAgICBpZiAodHlwZSA9PT0gMSkge1xyXG4gICAgICAgICAgICBuZXdHZW9tZXRyeSA9IHNoaWZ0Q29vcmRzKGZlYXR1cmUuZ2VvbWV0cnksIG9mZnNldCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbmV3R2VvbWV0cnkgPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBmZWF0dXJlLmdlb21ldHJ5Lmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdHZW9tZXRyeS5wdXNoKHNoaWZ0Q29vcmRzKGZlYXR1cmUuZ2VvbWV0cnlbal0sIG9mZnNldCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZXdGZWF0dXJlcy5wdXNoKHtcclxuICAgICAgICAgICAgZ2VvbWV0cnk6IG5ld0dlb21ldHJ5LFxyXG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgICAgICB0YWdzOiBmZWF0dXJlLnRhZ3MsXHJcbiAgICAgICAgICAgIG1pbjogW2ZlYXR1cmUubWluWzBdICsgb2Zmc2V0LCBmZWF0dXJlLm1pblsxXV0sXHJcbiAgICAgICAgICAgIG1heDogW2ZlYXR1cmUubWF4WzBdICsgb2Zmc2V0LCBmZWF0dXJlLm1heFsxXV1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3RmVhdHVyZXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNoaWZ0Q29vcmRzKHBvaW50cywgb2Zmc2V0KSB7XHJcbiAgICB2YXIgbmV3UG9pbnRzID0gW107XHJcbiAgICBuZXdQb2ludHMuYXJlYSA9IHBvaW50cy5hcmVhO1xyXG4gICAgbmV3UG9pbnRzLmRpc3QgPSBwb2ludHMuZGlzdDtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIG5ld1BvaW50cy5wdXNoKFtwb2ludHNbaV1bMF0gKyBvZmZzZXQsIHBvaW50c1tpXVsxXSwgcG9pbnRzW2ldWzJdXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3UG9pbnRzO1xyXG59XHJcbiJdfQ==
