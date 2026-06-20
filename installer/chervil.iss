; Inno Setup script for Chervil.
;
; Build flow (see docs/building-the-installer.md):
;   1) npm ci
;   2) npm run package           -> dist\Chervil-win32-x64\Chervil.exe
;   3) ISCC /DMyAppVersion=0.1.0 installer\chervil.iss
;
; The wizard collects API keys, a default provider, and an "About You" profile,
; then writes %APPDATA%\Chervil\firstrun.json. Chervil imports those on first
; launch (encrypting keys via Electron safeStorage) and deletes the file.

#ifndef MyAppVersion
  #define MyAppVersion "0.1.1"
#endif
#define MyAppName "Chervil"
#define MyAppPublisher "Rod Trent"
#define MyAppURL "https://getchervil.com"
#define MyAppExeName "Chervil.exe"
#define MyAppId "B9D4E2A1-7C3F-4E58-9A21-6F0C2D8E5B47"
#define SourceDir "..\dist\Chervil-win32-x64"

[Setup]
AppId={{#MyAppId}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
OutputDir=..\dist\installer
OutputBaseFilename=Chervil-Setup-{#MyAppVersion}
SetupIconFile=..\build\icon.ico
UninstallDisplayIcon={app}\{#MyAppExeName}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startup"; Description: "Start Chervil automatically when I sign in"; GroupDescription: "Startup:"; Flags: unchecked

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; AppUserModelID: "{#MyAppName}"
Name: "{userdesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; AppUserModelID: "{#MyAppName}"; Tasks: desktopicon

[Registry]
; Run at sign-in (per-user) when the startup task is selected.
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "{#MyAppName}"; ValueData: """{app}\{#MyAppExeName}"""; Flags: uninsdeletevalue; Tasks: startup

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#MyAppName}}"; Flags: nowait postinstall skipifsilent

[Code]
var
  KeysPage: TInputQueryWizardPage;
  ProviderPage: TInputOptionWizardPage;
  AboutPage: TWizardPage;
  AboutMemo: TNewMemo;

procedure InitializeWizard;
begin
  { 1) API keys — all optional; blank = skip and set later in Settings. }
  KeysPage := CreateInputQueryPage(wpSelectTasks,
    'AI provider keys',
    'Set up your API keys now, or skip and add them later.',
    'Paste any keys you already have — leave the rest blank. You can always add or change keys in Settings (the gear icon) > Provider. Keys are stored encrypted on this PC and never sent anywhere except the provider you use.');
  KeysPage.Add('Anthropic (Claude) API key:', True);
  KeysPage.Add('OpenAI API key:', True);
  KeysPage.Add('xAI (Grok) API key:', True);
  KeysPage.Add('Google (Gemini) API key:', True);

  { 2) Default provider — only shown when at least one key was entered (see ShouldSkipPage). }
  ProviderPage := CreateInputOptionPage(KeysPage.ID,
    'Default provider',
    'Choose the AI provider Chervil should use by default.',
    'You can switch providers anytime in Settings.', True, False);
  ProviderPage.Add('Claude (Anthropic)');
  ProviderPage.Add('OpenAI');
  ProviderPage.Add('Grok (xAI)');
  ProviderPage.Add('Gemini (Google)');
  ProviderPage.Add('Ollama (local, free)');
  ProviderPage.SelectedValueIndex := 0;

  { 3) About You — optional personal memory that tailors composed pages. }
  AboutPage := CreateCustomPage(ProviderPage.ID,
    'About you (optional)',
    'Tell Sprig a little about yourself so pages can be tailored to you. Skip it and add it later in Settings > About you.');
  AboutMemo := TNewMemo.Create(WizardForm);
  AboutMemo.Parent := AboutPage.Surface;
  AboutMemo.Left := 0;
  AboutMemo.Top := 0;
  AboutMemo.Width := AboutPage.SurfaceWidth;
  AboutMemo.Height := AboutPage.SurfaceHeight;
  AboutMemo.ScrollBars := ssVertical;
  AboutMemo.WordWrap := True;
end;

function AnyKeyEntered: Boolean;
begin
  Result := (Trim(KeysPage.Values[0]) <> '') or (Trim(KeysPage.Values[1]) <> '')
         or (Trim(KeysPage.Values[2]) <> '') or (Trim(KeysPage.Values[3]) <> '');
end;

function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := False;
  if PageID = ProviderPage.ID then
    Result := not AnyKeyEntered; { no keys -> nothing to pick a default among }
end;

function JsonEsc(const S: string): string;
var
  i: Integer;
  c: Char;
  r: string;
begin
  r := '';
  for i := 1 to Length(S) do
  begin
    c := S[i];
    case c of
      '"': r := r + '\"';
      '\': r := r + '\\';
      #10: r := r + '\n';
      #13: r := r + '\r';
      #9:  r := r + '\t';
    else
      r := r + c;
    end;
  end;
  Result := r;
end;

function ProviderId(Index: Integer): string;
begin
  case Index of
    0: Result := 'claude';
    1: Result := 'openai';
    2: Result := 'grok';
    3: Result := 'gemini';
    4: Result := 'ollama';
  else
    Result := 'claude';
  end;
end;

procedure AddKey(var Keys: string; const Name, Value: string);
begin
  if Trim(Value) <> '' then
  begin
    if Keys <> '' then Keys := Keys + ',';
    Keys := Keys + '"' + Name + '":"' + JsonEsc(Trim(Value)) + '"';
  end;
end;

procedure WriteFirstRun;
var
  Dir, Path, Json, Keys: string;
begin
  Keys := '';
  AddKey(Keys, 'claude', KeysPage.Values[0]);
  AddKey(Keys, 'openai', KeysPage.Values[1]);
  AddKey(Keys, 'grok',   KeysPage.Values[2]);
  AddKey(Keys, 'gemini', KeysPage.Values[3]);

  Json := '{"keys":{' + Keys + '}';
  if AnyKeyEntered then
    Json := Json + ',"provider":"' + ProviderId(ProviderPage.SelectedValueIndex) + '"';
  if Trim(AboutMemo.Text) <> '' then
    Json := Json + ',"profile":"' + JsonEsc(Trim(AboutMemo.Text)) + '"';
  Json := Json + '}';

  Dir := ExpandConstant('{userappdata}\Chervil');
  ForceDirectories(Dir);
  Path := Dir + '\firstrun.json';
  SaveStringToFile(Path, Json, False);
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
    WriteFirstRun;
end;
