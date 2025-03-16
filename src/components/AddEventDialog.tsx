import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "./ui/use-toast";

interface Mentee {
  id: string;
  name: string;
  image?: string | null;
}

interface AddEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot?: { start: Date; end: Date };
  onEventAdd: (event: { 
    title: string; 
    start: Date; 
    end: Date; 
    menteeId?: string;
    description?: string;
  }) => Promise<void>;
}

export function AddEventDialog({
  isOpen,
  onClose,
  selectedSlot,
  onEventAdd,
}: AddEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [menteeId, setMenteeId] = useState("");
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMentees, setIsLoadingMentees] = useState(false);
  
  // Fetch mentees when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchMentees();
    }
  }, [isOpen]);
  
  const fetchMentees = async () => {
    setIsLoadingMentees(true);
    try {
      const response = await fetch("/api/connections/list");
      if (!response.ok) {
        throw new Error("Failed to fetch mentees");
      }
      const data = await response.json();
      // Filter connections where current user is the mentor and convert to mentee format
      const menteesList = data
        .filter((connection: any) => connection.status === 'ACCEPTED')
        .map((connection: any) => ({
          id: connection.menteeId,
          name: connection.mentee?.name || 'Unknown Mentee',
          image: connection.mentee?.image
        }));
      setMentees(menteesList);
    } catch (error) {
      console.error("Error fetching mentees:", error);
      toast({
        title: "Error",
        description: "Failed to load mentees",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMentees(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for this session",
        variant: "destructive",
      });
      return;
    }
    
    if (!menteeId) {
      toast({
        title: "Error",
        description: "Please select a mentee for this session",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onEventAdd({
        title,
        description,
        menteeId,
        start: selectedSlot.start,
        end: selectedSlot.end,
      });
      toast({
        title: "Success",
        description: "Event added successfully",
      });
      onClose();
      setTitle("");
      setDescription("");
      setMenteeId("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0B0E14] border-0 p-0 gap-0 max-w-md w-full rounded-lg shadow-xl text-white overflow-hidden"dialog-content-custom-class>
        <div className="flex items-center justify-between p-3 border-b border-[rgba(255,255,255,0.06)]">
          <h2 className="text-sm font-normal text-white">Add Event</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.02)] rounded-full h-7 w-7 p-0"
          >
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 space-y-3">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Event Name</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event name"
                className="bg-[#0B0E14] border-[rgba(255,255,255,0.06)] text-white text-xs placeholder:text-gray-500 h-8 px-2"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter event description"
                className="bg-[#0B0E14] border-[rgba(255,255,255,0.06)] text-white text-xs placeholder:text-gray-500 min-h-[60px] px-2 py-1.5"
              />
            </div>

            {selectedSlot && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Date</label>
                <div className="bg-[#0B0E14] border border-[rgba(255,255,255,0.06)] rounded text-xs text-white p-2 flex items-center justify-between">
                  <span>{format(selectedSlot.start, "EEE, MMM d, yyyy")}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Start Time</label>
                <div className="bg-[#0B0E14] border border-[rgba(255,255,255,0.06)] rounded text-xs text-white p-2">
                  {format(selectedSlot?.start || new Date(), "HH:mm")}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">End Time</label>
                <div className="bg-[#0B0E14] border border-[rgba(255,255,255,0.06)] rounded text-xs text-white p-2">
                  {format(selectedSlot?.end || new Date(), "HH:mm")}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Mentee</label>
              <Select
                value={menteeId}
                onValueChange={(value) => setMenteeId(value)}
                disabled={isLoadingMentees}
              >
                <SelectTrigger className="bg-[#0B0E14] border-[rgba(255,255,255,0.06)] text-white text-xs placeholder:text-gray-500 h-8 px-2">
                  <SelectValue placeholder="Select a mentee" />
                </SelectTrigger>
                <SelectContent className="bg-[#0B0E14] border-[rgba(255,255,255,0.06)] text-white text-xs">
                  {mentees.map((mentee) => (
                    <SelectItem key={mentee.id} value={mentee.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundSize: "cover",
                            ...(mentee.image ? { backgroundImage: `url(${mentee.image})` } : {}),
                          }}
                        >
                          {!mentee.image && (
                            <span className="text-xs text-white">
                              {mentee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span>{mentee.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(255,255,255,0.06)]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.02)] text-xs h-7 px-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-2"
            >
              Add Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 