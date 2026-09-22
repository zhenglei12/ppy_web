const nameMap = {
  staff: "销售统计",
  edit: "编辑统计",
  classify: "文档管理",
  order: "订单管理",
  role: "角色管理",
  user: "用户管理",
  device: "设备管理",
  operation_account: "运营账户",
  department: "部门管理",
};

class Permission {
  _type = "item";
  _changed = false;
  _checked = false;
  _disabled = false;

  alias = "";

  get zhName() {
    return nameMap[this.name] ?? this.name;
  }

  constructor(name, data, group = null) {
    this.name = name;
    this.data = data;
    this.setGroup(group);
  }

  set checked(bool) {
    if (bool != this._checked) {
      this.setCheck(bool);
      this.group && this.group.refresh();
    }
  }

  get checked() {
    return this._checked;
  }

  set disabled(bool) {
    if (bool != this._disabled) {
      this.setDisable(bool);
      this.group && this.group.refresh();
    }
  }

  get disabled() {
    return this._disabled;
  }

  setGroup(group) {
    this.group = group;
    if (!group) {
      return;
    }
    if (group._type === this._type) {
      group.items.push(this);
    } else {
      group.items.unshift(this);
    }
  }

  setCheck(bool, reset = false) {
    if (bool != this.checked && !this.disabled) {
      this._checked = bool;
      this._changed = reset ? false : !this._changed;
    }
  }

  setDisable(bool) {
    this._disabled = bool;
  }

  hasChanged() {
    return this._changed;
  }
}

export class PermissionGroup extends Permission {
  _type = "group";

  checkedCount = 0;
  disabledCount = 0;

  permissions = new Map();

  items = [];

  constructor(items = [], name = null, data = null, group = null) {
    super(name, data, group);
    items.forEach((_) => this.addChild(_));
  }

  addChild(item) {
    let items = item.name.split("-");
    let _permission = new Permission(
      items.pop(),
      item,
      items.reduce((group, name) => {
        let _group = group.items.find((_) => _._type === "group" && _.name === name);
        return _group || new PermissionGroup([], name, null, group);
      }, this)
    );
    _permission.alias = item.alias;
    this.permissions.set(item.name, _permission);
  }

  getChecked(filter = null, mapper = null) {
    let items = [];
    this.permissions.forEach((item) => {
      if (item.checked && (!filter || filter(item))) {
        items.push(mapper ? mapper(item) : item);
      }
    });
    return items;
  }

  each(fn = null) {
    for (let item of this.items) {
      if (item instanceof PermissionGroup) {
        item.each(fn);
      } else {
        fn(item);
      }
    }
    return this;
  }

  has(key) {
    return this.permissions.has(key);
  }

  changeState(key, checked = null, disabled = null) {
    let permission = this.permissions.get(key);
    if (!permission) {
      return;
    }
    if (permission.disabled && disabled === false) {
      permission.disabled = false;
    }
    if (checked !== null) {
      permission.checked = checked;
    }
    if (disabled !== null) {
      permission.disabled = disabled;
    }
  }

  setCheck(bool, reset = false) {
    this.items.forEach((item) => item.setCheck(bool, reset));
    this.refresh();
  }

  setDisable(bool) {
    this.items.forEach((item) => item.setDisable(bool));
    this.refresh();
  }

  refresh() {
    let anyChecked = false,
      allChecked = true,
      anyDisabled = false,
      allDisabled = true;
    this.disabledCount = this.checkedCount = 0;
    for (let item of this.items) {
      if (item instanceof PermissionGroup) {
        this.checkedCount += item.checkedCount;
        this.disabledCount += item.disabledCount;
      } else {
        if (item.checked) {
          this.checkedCount += 1;
        }
        if (item.disabled) {
          this.disabledCount += 1;
        }
      }

      if (item.checked || item["anyChecked"]) {
        anyChecked = true;
      }
      if (!item.checked) {
        allChecked = false;
      }

      if (item.disabled || item["anyDisabled"]) {
        anyDisabled = true;
      }
      if (!item.disabled) {
        allDisabled = false;
      }
    }
    this._checked = allChecked;
    this.anyChecked = anyChecked && !allChecked;

    this._disabled = allDisabled && this.items.length > 0;
    this.anyDisabled = anyDisabled && !allDisabled;

    this.group && this.group.refresh();
  }

  hasChanged() {
    for (let item of this.items) {
      if (item.hasChanged()) {
        return true;
      }
    }
    return false;
  }
}
