import { Icon } from "@iconify/react"
import ChevronRight from "@mui/icons-material/ChevronRight"
import LinearProgress from "@mui/material/LinearProgress"
import debounce from "lodash.debounce"
import type { ChangeEventHandler, KeyboardEventHandler } from "react"
import { Component, useEffect, useMemo, useState } from "react"

import { search as searcher } from "./logic/search"

import type { Match } from "src/workers/helpers/search-text"

function Input({
  placeholder,
  actions,
  onChange,
  onEnter
}: {
  placeholder?: string
  actions: {
    icon: string
    active: boolean
    onClick: () => void
  }[]
  onChange?: ChangeEventHandler<HTMLInputElement>
  onEnter?: KeyboardEventHandler<HTMLInputElement>
}) {
  return (
    <div class="flex items-center bg-dark-100 min-w-0">
      <input
        onChange={onChange}
        placeholder={placeholder}
        onKeyUp={
          onEnter
            ? (event) => {
                if (event.code === "Enter") onEnter(event)
              }
            : undefined
        }
        class="block min-w-0 h-[24px] flex-1 bg-transparent text-[14px] py-[4px] pl-1 focus-visible:outline-none border border-gray-700 focus:border-blue-300"
      />

      {actions.map((action) => {
        return (
          <Icon
            key={action.icon}
            icon={action.icon}
            class={
              "cursor-pointer px-[1px] mx-[1px] w-[20px] h-full" +
              (action.active ? " text-blue-400" : "")
            }
            onClick={action.onClick}
          />
        )
      })}
    </div>
  )
}

export function Search() {
  const [openReplacer, setOpenReplacer] = useState(false)
  const [openAdvanced, setOpenAdvanced] = useState(false)

  const [search, setSearch] = useState("")
  const [include, setInclude] = useState("")
  const [exclude, setExclude] = useState("")

  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [regexp, setRegExp] = useState(false)

  const [preserveCase, setPreserveCase] = useState(false)

  const searchResult = useMemo(
    () =>
      search.trim()
        ? searcher({
            search,
            caseSensitive,
            wholeWord,
            regexp,
            include: include
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            exclude: exclude
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          })
        : null,

    [search, include, exclude, caseSensitive, wholeWord, regexp]
  )
  console.log({ search })
  return (
    <div class="w-full text-gray-200">
      <div class="flex relative mr-2">
        <div
          style={{
            all: "inherit"
          }}
          class="!cursor-pointer hover:!bg-dark-400 !mx-0"
          onClick={() => setOpenReplacer(!openReplacer)}
        >
          <ChevronRight
            fontSize="small"
            class={"my-auto" + (openReplacer ? " transform rotate-90" : "")}
          />
        </div>
        <div class="w-full min-w-0">
          <Input
            onChange={debounce((event) => setSearch(event.target.value), 1000)}
            actions={[
              {
                icon: "codicon:case-sensitive",
                onClick: () => setCaseSensitive(!caseSensitive),
                active: caseSensitive
              },
              {
                icon: "codicon:whole-word",
                onClick: () => setWholeWord(!wholeWord),
                active: wholeWord
              },
              {
                icon: "codicon:regex",
                onClick: () => setRegExp(!regexp),
                active: regexp
              }
            ]}
            placeholder="Search"
          />
          {openReplacer && (
            <div class="flex items-center mt-1">
              <Input
                actions={[
                  {
                    icon: "codicon:preserve-case",
                    onClick: () => setPreserveCase(!preserveCase),
                    active: preserveCase
                  }
                ]}
                placeholder="Replace"
              />
              <Icon
                icon="codicon:replace-all"
                class="cursor-pointer px-[2px] w-[20px] h-full"
              />
            </div>
          )}
        </div>
      </div>

      <div class="text-right mx-2 mb-[-20px]">
        <Icon
          icon="ph:dots-three-bold"
          class="w-[24px] h-[24px] cursor-pointer"
          onClick={() => setOpenAdvanced(!openAdvanced)}
        />
      </div>

      {openAdvanced && (
        <div class="mx-2">
          <small class="text-muted leading-0">files to include</small>
          <Input
            actions={[
              {
                icon: "codicon:book",
                onClick: () => setPreserveCase(!preserveCase),
                active: preserveCase
              }
            ]}
            onChange={(event) => setInclude(event.target.value)}
            placeholder="e.g. *.ts, src/**/include"
          />

          <small class="text-muted">files to exclude</small>
          <Input
            actions={[
              {
                icon: "codicon:exclude",
                onClick: () => setPreserveCase(!preserveCase),
                active: preserveCase
              }
            ]}
            onChange={(event) => setExclude(event.target.value)}
            placeholder="e.g. *.ts, src/**/exclude"
          />
        </div>
      )}

      {searchResult && <SearchResult asyncGenerator={searchResult} />}
    </div>
  )
}

interface SearchResultProps {
  asyncGenerator: AsyncGenerator<
    {
      filepath: string
      matches: Match[]
    },
    void,
    unknown
  >
}
interface SearchResultState {
  isLoading: boolean
  searched: Record<string, Match[]>
}
class SearchResult extends Component<SearchResultProps, SearchResultState> {
  constructor(props: SearchResultProps) {
    super(props)

    this.state = {
      isLoading: false,
      searched: {} as Record<string, Match[]>
    }
  }

  componentDidMount() {
    this.loadMatches()
  }

  private async loadMatches() {
    console.log(this.props.asyncGenerator)
    this.setState({
      isLoading: true,
      searched: {}
    })

    for await (const { filepath, matches } of this.props.asyncGenerator) {
      if (matches.length === 0) continue

      this.setState({
        searched: {
          ...this.state.searched,
          [filepath]: matches
        }
      })
    }

    this.setState({
      isLoading: false
    })
  }

  public render() {
    return (
      <div>
        {this.state.isLoading && (
          <div class="w-100 absolute top-0 left-0">
            <LinearProgress
              color="inherit"
              sx={{
                height: 2
              }}
            />
          </div>
        )}
        {Object.entries(this.state.searched).map(([filepath, matches]) => {
          return <div key={filepath}>{filepath}</div>
        })}
      </div>
    )
  }
}
