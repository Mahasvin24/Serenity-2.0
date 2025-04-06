"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsPanel() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [streamResponse, setStreamResponse] = useState(true);
  const [theme, setTheme] = useState("system");

  return (
    <Tabs defaultValue="model">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="model">Model</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>
      <TabsContent value="model" className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
          />
          <p className="text-xs text-muted-foreground">
            Your API key is stored locally and never sent to our servers.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="model-select">Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id="model-select">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
              <SelectItem value="llama-3-70b">Llama 3 70B</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="temperature">Temperature: {temperature}</Label>
          </div>
          <Slider
            id="temperature"
            min={0}
            max={2}
            step={0.1}
            value={[temperature]}
            onValueChange={(value) => setTemperature(value[0])}
          />
          <p className="text-xs text-muted-foreground">
            Higher values produce more creative results, lower values are more
            deterministic.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="max-tokens">Max Tokens: {maxTokens}</Label>
          </div>
          <Slider
            id="max-tokens"
            min={100}
            max={8000}
            step={100}
            value={[maxTokens]}
            onValueChange={(value) => setMaxTokens(value[0])}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="stream"
            checked={streamResponse}
            onCheckedChange={setStreamResponse}
          />
          <Label htmlFor="stream">Stream response</Label>
        </div>
      </TabsContent>
      <TabsContent value="appearance" className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label>Theme</Label>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light">Light</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark">Dark</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system">System</Label>
            </div>
          </RadioGroup>
        </div>
      </TabsContent>
      <TabsContent value="advanced" className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="system-prompt">System Prompt</Label>
          <Input
            id="system-prompt"
            placeholder="You are a helpful assistant..."
          />
          <p className="text-xs text-muted-foreground">
            Define the behavior and capabilities of the AI assistant.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="base-url">API Base URL</Label>
          <Input id="base-url" placeholder="https://api.openai.com/v1" />
          <p className="text-xs text-muted-foreground">
            For custom endpoints or self-hosted models.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
