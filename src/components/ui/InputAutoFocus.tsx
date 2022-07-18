import { Component } from "react"

export class InputAutoFocus extends Component<{
  className?: string
  onBlur?: React.FormEventHandler<HTMLInputElement>
  value?: string
  onInput?: React.FormEventHandler<HTMLInputElement>
  onKeyDown?: React.FormEventHandler<HTMLInputElement>
}> {
  private el: HTMLInputElement | null = null
  private mounted = false

  componentDidMount() {
    this.el?.focus({
      preventScroll: false
    })
    this.mounted = true
  }

  render() {
    return (
      <input
        ref={(input) => (this.el = input)}
        className={this.props.className ?? ""}
        onBlur={(event) => {
          if (this.mounted) this.props.onBlur?.(event)
        }}
        value={this.props.value}
        onInput={this.props.onInput}
        onKeyDown={this.props.onKeyDown}
        type="text"
      />
    )
  }
}
