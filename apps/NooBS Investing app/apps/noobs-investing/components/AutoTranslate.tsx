import React, { useMemo } from "react";
import { useI18n } from "../i18n";

const translateStringNode = (
  value: string,
  tr: (text: string) => string
): string => {
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match) {
    return tr(value);
  }
  const [, prefix, core, suffix] = match;
  if (!core) {
    return value;
  }
  return `${prefix}${tr(core)}${suffix}`;
};

const translateNodeTree = (
  node: React.ReactNode,
  tr: (text: string) => string
): React.ReactNode => {
  if (typeof node === "string") {
    return translateStringNode(node, tr);
  }
  if (Array.isArray(node)) {
    return node.map((entry, index) => {
      const translated = translateNodeTree(entry, tr);
      return React.isValidElement(translated) ? (
        translated
      ) : (
        <React.Fragment key={index}>{translated}</React.Fragment>
      );
    });
  }
  if (!React.isValidElement(node)) {
    return node;
  }

  const element = node as React.ReactElement<{ children?: React.ReactNode }>;
  const props = element.props;
  if (props.children === undefined) {
    return element;
  }

  const translatedChildren = translateNodeTree(props.children, tr);
  return React.cloneElement(element, element.props, translatedChildren);
};

export function AutoTranslate({ children }: { children: React.ReactNode }) {
  const { language, tr } = useI18n();
  const translated = useMemo(
    () => (language === "es" ? translateNodeTree(children, tr) : children),
    [children, language, tr]
  );
  return <>{translated}</>;
}

