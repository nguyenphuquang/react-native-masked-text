import BaseMask from './_base.mask'
import VanillaMasker from '../internal-dependencies/vanilla-masker'

const MONEY_MASK_SETTINGS = {
    precision: 2,
    separator: ',',
    delimiter: '.',
    unit: 'R$',
    suffixUnit: '',
    allowMinus: false,
}

export default class MoneyMask extends BaseMask {
    static getType() {
        return 'money'
    }

    getValue(value, settings, oldValue) {
        let mergedSettings = super.mergeSettings(MONEY_MASK_SETTINGS, settings)

        // quang's
        let sign = 1
        if (mergedSettings.allowMinus) {
          if (typeof value == 'string') {
            const match = value.match(/[\s\d]*-(.*)$/)
            if (match) {
              value = match[1]
              if (value == '') return '-'
              sign = -1
            }
          } else if (typeof value == 'number') {
            if (value < 0) {
              value = -value
              sign = -1
            }
          }
        }
        // quang's

        let sanitized = this._sanitize(value, mergedSettings)

        if (mergedSettings.suffixUnit && oldValue && sanitized) {
            if (sanitized.length == oldValue.length - 1) {
                let cleared = this.removeNotNumbers(sanitized)
                sanitized = cleared.substr(0, cleared.length - 1)
            }
        }

        let masked = VanillaMasker.toMoney(sanitized, mergedSettings)
        if (sign == -1) masked = '-' + masked

        return masked
    }

    getRawValue(maskedValue, settings) {
        let mergedSettings = super.mergeSettings(MONEY_MASK_SETTINGS, settings)

        if (mergedSettings.allowMinus) {
          if (maskedValue == '-') {
            return '-'
          }
        }

        let normalized = super.removeNotNumbers(maskedValue)

        let dotPosition = normalized.length - mergedSettings.precision
        normalized = this._insert(normalized, dotPosition, '.')

        return Number(normalized)
    }

    validate(value, settings) {
        return true
    }

    _sanitize(value, settings) {
        if (typeof value === 'number') {
            return value.toFixed(settings.precision)
        }

        return value
    }

    _insert(text, index, string) {
        if (index > 0) {
            return (
                text.substring(0, index) +
                string +
                text.substring(index, text.length)
            )
        } else {
            return string + text
        }
    }
}
