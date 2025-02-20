import { Form, Input, Select, Space, Switch } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useTranslation } from 'react-i18next';
import {
  iUnifieFormSchema,
  iUnifieFormSchemaInput,
  iUnifieFormSelectParams,
} from 'types/unifieForms';

export const dynamic = 'force-dynamic';

interface iUnifieFormProps {
  schema: iUnifieFormSchema;
  initialValues: any;
}

export const UnifieForm = (props: iUnifieFormProps) => {
  const { t } = useTranslation('unifie');

  const schema = props.schema;

  if (typeof window === 'undefined') {
    return null;
  }
  return (
    <>
      {schema.properties.map((item: iUnifieFormSchemaInput, index) => {
        if (item.type === 'string') {
          return (
            <Form.Item label={t(item.label)} name={item.name} key={index}>
              <Input type="text" />
            </Form.Item>
          );
        } else if (item.type === 'boolean') {
          return (
            <Form.Item label={t(item.label)} name={item.name} key={index}>
              <Switch />
            </Form.Item>
          );
        } else if (item.type === 'number') {
          return (
            <Form.Item label={t(item.label)} name={item.name} key={index}>
              <Input type="number" />
            </Form.Item>
          );
        } else if (item.type === 'select') {
          const params: iUnifieFormSelectParams = item.params || {};
          return (
            <Form.Item label={t(item.label)} name={item.name} key={index}>
              <Select>
                {(params?.options || []).map((opt) => {
                  return (
                    <Select.Option value={opt.value}>
                      {opt.title || opt.value}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          );
        } else if (item.type === 'textarea') {
          return (
            <Form.Item label={t(item.label)} name={item.name} key={index}>
              <TextArea rows={8} />
            </Form.Item>
          );
        }
        return <Input type="text" key={index} value={item.name} />;
      })}
    </>
  );
};
