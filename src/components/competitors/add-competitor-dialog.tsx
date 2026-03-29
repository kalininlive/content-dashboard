"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Platform } from "@/types/index";
import { PLATFORM_META } from "@/lib/calendar-mock-data";
import { useI18n } from "@/lib/i18n";

interface AddCompetitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, handle: string, platform: Platform) => void;
}

const DEFAULT = { name: "", handle: "", platform: "instagram" as Platform };

export function AddCompetitorDialog({
  open,
  onOpenChange,
  onAdd,
}: AddCompetitorDialogProps) {
  const { t } = useI18n();
  const [form, setForm] = useState(DEFAULT);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.handle.trim()) return;
    onAdd(form.name.trim(), form.handle.trim(), form.platform);
    setForm(DEFAULT);
    onOpenChange(false);
  }

  function handleCancel() {
    setForm(DEFAULT);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-base">{t("addCompetitor.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="comp-name" className="text-xs text-muted-foreground">
              {t("addCompetitor.nameLabel")}
            </Label>
            <Input
              id="comp-name"
              placeholder={t("addCompetitor.namePlaceholder")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="text-sm"
              required
            />
          </div>

          {/* Handle */}
          <div className="space-y-1.5">
            <Label htmlFor="comp-handle" className="text-xs text-muted-foreground">
              {t("addCompetitor.handleLabel")}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                @
              </span>
              <Input
                id="comp-handle"
                placeholder={t("addCompetitor.handlePlaceholder")}
                value={form.handle.replace(/^@/, "")}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                className="pl-7 text-sm"
                required
              />
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t("addCompetitor.platformLabel")}</Label>
            <Select
              value={form.platform}
              onValueChange={(v) => setForm({ ...form, platform: v as Platform })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PLATFORM_META) as Platform[]).map((p) => (
                  <SelectItem key={p} value={p} className="text-sm">
                    {PLATFORM_META[p].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-[11px] text-muted-foreground/60">
            {t("addCompetitor.demoNote")}
          </p>

          <DialogFooter className="pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!form.name.trim() || !form.handle.trim()}
            >
              {t("addCompetitor.addButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
