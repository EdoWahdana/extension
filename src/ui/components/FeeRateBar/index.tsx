import { CSSProperties, useEffect, useState } from 'react';

import { colors } from '@/ui/theme/colors';
import { useWallet } from '@/ui/utils';

import { Column } from '../Column';
import { Input } from '../Input';
import { Row } from '../Row';
import { Text } from '../Text';

enum FeeRateType {
  SLOW,
  AVG,
  FAST,
  CUSTOM
}

const MAX_FEE_RATE = 10000;

export function FeeRateBar({ readonly, onChange }: { readonly?: boolean; onChange?: (val: number) => void }) {
  const wallet = useWallet();
  const [feeOptions, setFeeOptions] = useState<{ title: string; desc?: string; feeRate: number }[]>([]);

  useEffect(() => {
    wallet.getFeeSummary().then((v) => {
      if (readonly) {
        setFeeOptions(v.list);
      } else {
        setFeeOptions([...v.list, { title: 'Custom', feeRate: 0 }]);
      }
    });
  }, []);

  const [feeOptionIndex, setFeeOptionIndex] = useState(FeeRateType.AVG);
  const [feeRateInputVal, setFeeRateInputVal] = useState('');

  useEffect(() => {
    const defaultOption = feeOptions[1];
    const defaultVal = defaultOption ? defaultOption.feeRate : 1;

    let val = defaultVal;
    if (feeOptionIndex === FeeRateType.CUSTOM) {
      val = parseFloat(feeRateInputVal) || 0;
    } else if (feeOptions.length > 0) {
      val = feeOptions[feeOptionIndex].feeRate;
    }
    onChange && onChange(val);
  }, [feeOptions, feeOptionIndex, feeRateInputVal]);

  const adjustFeeRateInput = (inputVal: string) => {
    const val = parseFloat(inputVal);
    if (!val) {
      setFeeRateInputVal('');
      return;
    }
    const defaultOption = feeOptions[1];
    const defaultVal = defaultOption ? defaultOption.feeRate : 1;
    if (val <= 0) {
      setFeeRateInputVal(defaultVal.toString());
    } else if (val > MAX_FEE_RATE) {
      setFeeRateInputVal(MAX_FEE_RATE.toString());
    } else {
      setFeeRateInputVal(inputVal);
    }
  };

  return (
    <Column>
      <Row justifyCenter>
        {feeOptions.map((v, index) => {
          let selected = index === feeOptionIndex;
          if (readonly) {
            selected = false;
          }

          return (
            <div
              key={v.title}
              onClick={() => {
                if (readonly) {
                  return;
                }
                setFeeOptionIndex(index);
              }}
              style={Object.assign(
                {},
                {
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)',
                  height: 75,
                  width: 75,
                  textAlign: 'center',
                  padding: 4,
                  borderRadius: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  cursor: 'pointer'
                } as CSSProperties,
                selected ? { backgroundColor: colors.primary } : {}
              )}
            >
              <Text text={v.title} textCenter style={{ color: selected ? colors.black : colors.white }} />
              {v.title !== 'Custom' && (
                <Text
                  text={`${v.feeRate} sat/vB`}
                  size="xxs"
                  textCenter
                  style={{ color: selected ? colors.black : colors.white }}
                />
              )}
              {v.title !== 'Custom' && (
                <Text
                  text={`${v.desc}`}
                  size="xxs"
                  textCenter
                  style={{ color: selected ? colors.black : colors.white_muted }}
                />
              )}
            </div>
          );
        })}
      </Row>
      {feeOptionIndex === FeeRateType.CUSTOM && (
        <Input
          preset="amount"
          placeholder={'sat/vB'}
          value={feeRateInputVal}
          runesDecimal={1}
          onAmountInputChange={(amount) => {
            adjustFeeRateInput(amount);
          }}
          // onBlur={() => {
          //   const val = parseInt(feeRateInputVal) + '';
          //   setFeeRateInputVal(val);
          // }}
          autoFocus={true}
        />
      )}
    </Column>
  );
}
