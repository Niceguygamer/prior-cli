# Prior CLI

**Prior** is an AI assistant for your terminal — built on the Prior Network platform.

```
  ██████╗ ██████╗ ██╗ ██████╗ ██████╗
  ██╔══██╗██╔══██╗██║██╔═══██╗██╔══██╗
  ██████╔╝██████╔╝██║██║   ██║██████╔╝
  ██╔═══╝ ██╔══██╗██║██║   ██║██╔══██╗
  ██║     ██║  ██║██║╚██████╔╝██║  ██║
  ╚═╝     ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝
```

## Install

```bash
npm install -g prior-cli
```

## Login

```bash
prior login
```

Opens a browser window to sign in with your Prior Network account.

## Usage

```bash
prior chat
```

Starts an interactive chat session. Prior can read and write files, run shell commands, search the web, check the weather, generate images, and interact with the Prior Network — all from a single prompt.

## What Prior can do

| Capability | Example prompt |
|---|---|
| **Files** | `read the file package.json` |
| **Shell** | `what node version am i on` |
| **Web search** | `what is the latest news in the philippines` |
| **Weather** | `what's the weather in tokyo` |
| **Image generation** | `generate a sunset over the ocean` |
| **Clipboard** | `read my clipboard` |
| **Prior Network** | `show my prior profile` |
| **Coding** | `write a python script that prints fibonacci numbers` |

## Agent mode

Prior runs as an autonomous agent — it can chain multiple tool calls together to complete complex tasks without you having to break things down step by step.

```
> find all .js files in this project and tell me which one is the largest
```

Prior will list the directory, check file sizes, and report back — all in one go.

## Slash commands

| Command | Description |
|---|---|
| `/help` | Show available commands |
| `/clear` | Clear the conversation |
| `/uncensored` | Enable uncensored mode |
| `/censored` | Return to default mode |
| `/exit` | Exit the CLI |

## Tips

- **Multiline input** — end a line with `\` and press Enter to continue on the next line
- **Clipboard images** — press `Alt+V` to attach an image from your clipboard
- **Cancel** — press `Ctrl+C` to cancel a running response

## Requirements

- Node.js 16+
- A [Prior Network](https://prior.ngrok.app) account

## License

MIT
