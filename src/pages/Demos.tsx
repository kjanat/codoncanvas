import { DemoCard } from "@/components/DemoCard";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { demos } from "@/data/demos";

export default function Demos() {
  return (
    <PageContainer>
      <PageHeader
        subtitle="Explore mutation types, evolution mechanics, and genetic concepts through hands-on demonstrations"
        title="Interactive Demos"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo) => (
          <DemoCard key={demo.path} {...demo} />
        ))}
      </div>
    </PageContainer>
  );
}
