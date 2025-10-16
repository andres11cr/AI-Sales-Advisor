import HardcodedChat from "@/components/chatbot/hardcoded-chat"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset } from "@/components/ui/sidebar"

export default async function ChatBot() {

  return (
    <SidebarInset>
      <SiteHeader title="Chatbot - AI Sales Advisor"/>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <HardcodedChat />
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
