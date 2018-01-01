// ref: http://cloudmark.github.io/Json-Mapping/

import "reflect-metadata";

const jsonMetadataKey = "jsonProperty";

interface JsonMetaData<T> {
  name?: string,
  clazz?: { new (): T }
}

export function JsonProperty<T>(metadata?: JsonMetaData<T> | string): any {
  if (metadata instanceof String || typeof metadata === "string") {
    return Reflect.metadata(jsonMetadataKey, {
      name: metadata,
      clazz: undefined
    });
  } else {
    let metadataObj = <JsonMetaData<T>>metadata;
    return Reflect.metadata(jsonMetadataKey, {
      name: metadataObj ? metadataObj.name : undefined,
      clazz: metadataObj ? metadataObj.clazz : undefined
    });
  }
}

function getClazz(target: any, propertyKey: string): any {
  return Reflect.getMetadata("design:type", target, propertyKey)
}

function getJsonProperty<T>(target: any, propertyKey: string): JsonMetaData<T> {
  return Reflect.getMetadata(jsonMetadataKey, target, propertyKey);
}

export class Json {
  static isPrimitive(obj) {
    switch (typeof obj) {
      case "string":
      case "number":
      case "boolean":
        return true;
    }
    return !!(obj instanceof String || obj === String ||
      obj instanceof Number || obj === Number ||
      obj instanceof Boolean || obj === Boolean);
  }

  static isArray(object) {
    if (object === Array) {
      return true;
    } else if (typeof Array.isArray === "function") {
      return Array.isArray(object);
    }
    else {
      return !!(object instanceof Array);
    }
  }

  static deserialize<T>(clazz: { new (): T }, jsonObject) {
    if ((clazz === undefined) || (jsonObject === undefined)) return undefined;
    let obj = new clazz();
    Object.keys(obj).forEach((key) => {
      let propertyMetadataFn: (IJsonMetaData) => any = (propertyMetadata) => {
        let propertyName = propertyMetadata.name || key;
        let innerJson = jsonObject ? jsonObject[propertyName] : undefined;
        let clazz = getClazz(obj, key);
        if (Json.isArray(clazz)) {
          let metadata = getJsonProperty(obj, key);
          if (metadata.clazz || Json.isPrimitive(clazz)) {
            if (innerJson && Json.isArray(innerJson)) {
              return innerJson.map(
                (item) => Json.deserialize(clazz, item)
              );
            } else {
              return undefined;
            }
          } else {
            return innerJson;
          }

        } else if (!Json.isPrimitive(clazz)) {
          return Json.deserialize(clazz, innerJson);
        } else {
          return jsonObject ? jsonObject[propertyName] : undefined;
        }
      };

      let propertyMetadata = getJsonProperty(obj, key);
      if (propertyMetadata) {
        obj[key] = propertyMetadataFn(propertyMetadata);
      } else {
        if (jsonObject && jsonObject[key] !== undefined) {
          obj[key] = jsonObject[key];
        }
      }
    });
    return obj;
  }
}
