import { MentorConnectionsClient } from "@/components/mentor-connections-client";
import { PendingConnectionRequests } from "@/components/pending-connection-requests";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Connections | MentorConnect",
  description: "Manage your mentee connections",
};

export default async function MentorConnectionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-light tracking-tight text-white">
          Your <span className="font-semibold text-[#00C6FF]">Connections</span>
        </h1>
        <p className="text-muted-foreground text-[16px] leading-relaxed">
          Manage your mentee connections and requests
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-[#111218] p-1 rounded-xl border border-gray-800">
          <TabsTrigger 
            value="pending" 
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3949AB] data-[state=active]:to-[#4A5BC7] data-[state=active]:text-white transition-all duration-300"
          >
            Pending Requests
          </TabsTrigger>
          <TabsTrigger 
            value="active" 
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3949AB] data-[state=active]:to-[#4A5BC7] data-[state=active]:text-white transition-all duration-300"
          >
            Active Connections
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-5">
          <Card className="bg-[#111218] border border-gray-800 rounded-xl p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl text-white">Pending Connection Requests</CardTitle>
              <CardDescription className="text-[#E0E0E0]">
                Review and respond to mentees who want to connect with you
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pt-4">
              <PendingConnectionRequests />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-5">
          <MentorConnectionsClient session={session} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 