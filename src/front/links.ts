
function appendEmptyInput(container: HTMLUListElement, inputs: NodeListOf<HTMLInputElement>)
{
	const lastInput = inputs[inputs.length - 1]
	if (!lastInput.parentElement || !lastInput.value.length) return

	const li      = lastInput.parentElement.cloneNode(true) as HTMLLIElement
	const idInput = li.querySelector<HTMLInputElement>('input[type=hidden]')
	const input   = li.querySelector<HTMLInputElement>('input:not([type=hidden])')
	if (!idInput || !input) return

	idInput.removeAttribute('data-last-value')
	idInput.setAttribute('value', '')
	idInput.value = ''

	input.classList.add('empty')
	input.removeAttribute('data-last-value')
	input.setAttribute('placeholder', '+')
	input.setAttribute('value', '')
	input.value = ''

	let dotPosition = idInput.id.lastIndexOf('.')
	idInput.setAttribute('id', dotPosition < 0 ? idInput.id : idInput.id.slice(0, dotPosition))
	dotPosition = idInput.name.lastIndexOf('.')
	idInput.setAttribute('name', dotPosition < 0 ? idInput.name : idInput.name.slice(0, dotPosition))
	dotPosition = input.name.lastIndexOf('.')
	input.setAttribute('name', dotPosition < 0 ? input.name : input.name.slice(0, dotPosition))

	const suggestions = li.querySelector('.suggestions')
	if (suggestions) {
		suggestions.remove()
	}

	return container.appendChild(li)
}

function autoDim(event: Event)
{
	const input       = event.target as HTMLInputElement
	const container   = input.closest('ul') as HTMLUListElement
	const inputs      = container.querySelectorAll<HTMLInputElement>('input:not([type=hidden])')
	const emptyInputs = updatePlaceholder(inputs)
	if (!appendEmptyInput(container, inputs)) {
		emptyInputs.pop()
	}
	removeEmptyInputs(emptyInputs)
}

export function links(input: HTMLInputElement)
{
	input.addEventListener('change', autoDim)
	input.addEventListener('input', autoDim)
}

function removeEmptyInputs(emptyInputs: HTMLInputElement[])
{
	for (const input of emptyInputs) {
		if (document.activeElement === input) continue
		input.closest('li')?.remove()
	}
}

function updatePlaceholder(inputs: NodeListOf<HTMLInputElement>)
{
	const emptyInputs: HTMLInputElement[] = []
	inputs.forEach(input => {
		if (input.value.length) {
			input.removeAttribute('placeholder')
		}
		else {
			emptyInputs.push(input)
			input.setAttribute('placeholder', '+')
		}
	})
	return emptyInputs
}
