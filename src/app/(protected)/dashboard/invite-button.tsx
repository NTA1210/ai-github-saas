"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useGetInviteLink } from "@/features/projects/api/use-invite-link";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useProjectStore } from "@/store/use-project-store";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const InviteButton = () => {
  const { selectedProject } = useProjectStore();
  const [open, setOpen] = useState<boolean>(false);
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const { data: inviteLink, isLoading } = useGetInviteLink(
    selectedProject?.id!,
  );

  const handleCopyLink = () => {
    copyToClipboard(
      `${window.location.origin}/join/${selectedProject?.id}?token=${inviteLink?.id}`,
    );
    toast.success("Link copied to clipboard");
  };
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Ask them to copy and paste this link
          </p>
          <Field>
            <InputGroup>
              <InputGroupInput
                className=" text-gray-900"
                readOnly
                onFocus={(e) => e.target.blur()}
                value={
                  isLoading
                    ? "Generating link..."
                    : `${window.location.origin}/join/${selectedProject?.id}?token=${inviteLink?.id}`
                }
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Copy"
                  title="Copy"
                  size="sm"
                  onClick={handleCopyLink}
                  className="cursor-pointer"
                >
                  {isCopied ? <Check /> : <Copy />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {isCopied && (
              <FieldDescription>
                This link will expire in an hour
              </FieldDescription>
            )}
          </Field>
        </DialogContent>
      </Dialog>

      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="cursor-pointer"
      >
        Invite Members
      </Button>
    </>
  );
};

export default InviteButton;
