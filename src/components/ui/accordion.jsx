import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  ...props
}) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-gray-700 last:border-b-0 rounded-lg mb-2 overflow-hidden bg-gray-800 shadow-sm", className)}
      {...props} />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          // 터치 영역 확대 및 모바일 최적화
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-lg px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 text-left text-base sm:text-lg md:text-xl font-medium transition-all outline-none hover:bg-gray-700 active:bg-gray-600 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180 min-h-[56px] sm:min-h-[64px]",
          className
        )}
        {...props}>
        <div className="flex-1 text-gray-200 leading-relaxed pr-2">
          {children}
        </div>
        <ChevronDownIcon
          className="text-muted-foreground pointer-events-none size-5 sm:size-6 shrink-0 translate-y-0.5 transition-transform duration-200 text-gray-400" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-base sm:text-lg text-gray-300 transition-all"
      {...props}>
      <div className={cn("px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 pt-0 border-t border-gray-700 bg-gray-800/50 leading-relaxed", className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
