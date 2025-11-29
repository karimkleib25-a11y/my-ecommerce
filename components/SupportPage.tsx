import { useState, FormEvent } from "react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { Layout } from "./Layout";

export function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Check throttle: 5 minutes = 300000 ms
    const lastTicketAt = Number(localStorage.getItem("lastTicketAt") || "0");
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    const elapsed = now - lastTicketAt;

    if (elapsed < fiveMinutes) {
      const remainingSeconds = Math.ceil((fiveMinutes - elapsed) / 1000);
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      toast.error(
        `Please wait ${minutes}m ${seconds}s before submitting another ticket`
      );
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Simulate API call
      localStorage.setItem("lastTicketAt", String(now));
      toast.success("Support ticket submitted successfully");
      setSubject("");
      setMessage("");
      setIsLoading(false);
    }, 800);
  };

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide details about your issue..."
                  rows={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Ticket"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                You can submit one ticket every 5 minutes
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
