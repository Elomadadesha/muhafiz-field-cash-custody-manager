import * as React from 'react';
export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>((props, ref) => <label ref={ref} className="mb-1 block text-sm font-medium" {...props} />);
Label.displayName='Label';
