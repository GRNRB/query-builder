import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      tabs={[
        {
          title: "React",
          url: "/docs/framework/react/",
        },
        {
          title: "Vanilla JS",
          url: "/docs/framework/vanilla-js/",
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
